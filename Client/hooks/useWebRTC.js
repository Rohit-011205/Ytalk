// import { useEffect,useState,useRef,react } from "react";    
// import { useAuthStore } from "../src/Store/useAuthStore";

// const ICE_SERVERS = {
//     iceServers: [
//         { urls: 'stun:stun.l.google.com:19302' },
//         { urls: 'stun:stun1.l.google.com:19302' },
//     ]
// };


import { useEffect, useRef, useState } from 'react';
import { Device } from 'mediasoup-client';
import { useAuthStore } from '../src/Store/useAuthStore';
import { useCallback } from 'react';

export const useMediasoup = (roomId) => {
    const { authUser, socket } = useAuthStore();

    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState(new Map());
    const [participants, setParticipants] = useState([]);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [connectionState, setConnectionState] = useState('connecting');

    const deviceRef = useRef(null);
    const sendTransportRef = useRef(null);
    const recvTransportRef = useRef(null);
    const producersRef = useRef(new Map());
    const consumersRef = useRef(new Map());
    const consumedProducers = useRef(new Set()); // prevents duplicate consumption
    const localStreamRef = useRef(null);
    const initializedRef = useRef(false);

    // useEffect(() => {
    //     if (!roomId || !authUser || !socket || initializedRef.current) return;
    //     initializedRef.current = true;
    //     init();
    //     return () => cleanup();
    // }, [roomId, authUser, socket]);
    const isMountedRef = useRef(false);

    useEffect(() => {
        if (!roomId || !authUser || !socket || isMountedRef.current) {
            return () => { }; // Empty cleanup
        }

        isMountedRef.current = true;
        init();

        return cleanup; // Safe local cleanup only
    }, []);

    // ─────────────────────────────────────────
    // STEP 1: Join room
    // Returns: { rtpCapabilities, existingProducers[] }
    // ─────────────────────────────────────────
    const joinRoom = () =>
        new Promise((resolve, reject) => {
            socket.emit('joinVideoCall', { roomId, userId: authUser._id }, (res) => {
                if (res?.error) return reject(new Error(res.error));
                console.log(`✅ Joined room. ${res.existingProducers?.length ?? 0} existing producers`);
                resolve(res);
            });
        });

    // ─────────────────────────────────────────
    // STEP 2: Load Device
    // ─────────────────────────────────────────
    const loadDevice = async (rtpCapabilities) => {
        const device = new Device();
        await device.load({ routerRtpCapabilities: rtpCapabilities });
        deviceRef.current = device;
        console.log('✅ Device loaded');
        return device;
    };

    // ─────────────────────────────────────────
    // STEP 3: Send transport (us → SFU)
    // ─────────────────────────────────────────
    const createSendTransport = (device) =>
        new Promise((resolve, reject) => {
            socket.emit('createProducerTransport', { roomId, userId: authUser._id }, (res) => {
                if (res?.error) return reject(new Error(res.error));

                if (!res.transports) {
                    console.error('❌ Backend missing transports:', res);
                    return reject(new Error('Backend missing transports'));
                }

                const transport = device.createSendTransport({
                    id: res.id,
                    iceParameters: res.iceParameters,
                    iceCandidates: res.iceCandidates,
                    dtlsParameters: res.dtlsParameters,
                });

                transport.on('connect', ({ dtlsParameters }, cb, eb) => {
                    socket.emit('connectTransport', {
                        transportId: transport.id,
                        dtlsParameters, roomId, userId: authUser._id,
                    }, (r) => r?.error ? eb(new Error(r.error)) : cb());
                });

                transport.on('produce', ({ kind, rtpParameters, appData }, cb, eb) => {
                    socket.emit('produce', {
                        transportId: transport.id,
                        kind, rtpParameters, appData, roomId, userId: authUser._id,
                    }, (r) => r?.error ? eb(new Error(r.error)) : cb({ id: r.id }));
                });

                transport.on('connectionstatechange', (s) => {
                    console.log('📤 Send transport:', s);
                    if (s === 'connected') setConnectionState('connected');
                });

                sendTransportRef.current = transport;
                console.log('✅ Send transport created');
                resolve(transport);
            });
        });

    // ─────────────────────────────────────────
    // STEP 4: Recv transport (SFU → us)
    // ─────────────────────────────────────────
    const createRecvTransport = (device) =>
        new Promise((resolve, reject) => {
            socket.emit('createConsumerTransport', { roomId, userId: authUser._id }, (res) => {
                if (res?.error) return reject(new Error(res.error));

                const transport = device.createRecvTransport({
                    id: res.id,
                    iceParameters: res.iceParameters,
                    iceCandidates: res.iceCandidates,
                    dtlsParameters: res.dtlsParameters,
                });
                let connectCalled = false;
                transport.on('connect', ({ dtlsParameters }, cb, eb) => {
                    if (connectCalled) return cb(); // If already called, just trigger the callback
                    connectCalled = true;

                    socket.emit('connectTransport', {
                        transportId: transport.id,
                        dtlsParameters, roomId, userId: authUser._id,
                    }, (r) => {
                        if (r?.error) {
                            connectCalled = false; // Reset on error so we can try again
                            eb(new Error(r.error));
                        } else {
                            cb();
                        }
                    })
                });

                transport.on('connectionstatechange', (s) => console.log('📥 Recv transport:', s));

                recvTransportRef.current = transport;
                console.log('✅ Recv transport created');
                resolve(transport);
            });
        });

    // ─────────────────────────────────────────
    // STEP 5: Camera + mic
    // ─────────────────────────────────────────
    const startLocalMedia = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: { echoCancellation: true, noiseSuppression: true },
        });

        localStreamRef.current = stream;
        setLocalStream(stream);

        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
            const vp = await sendTransportRef.current.produce({
                track: videoTrack,
                appData: { source: 'camera', userId: authUser._id },
            });
            producersRef.current.set('video', vp);
            console.log('📤 Producing video:', vp.id);
        }

        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
            const ap = await sendTransportRef.current.produce({
                track: audioTrack,
                appData: { source: 'microphone', userId: authUser._id },
            });
            producersRef.current.set('audio', ap);
            console.log('📤 Producing audio:', ap.id);
        }

        console.log('✅ Local media started');
    };

    // ─────────────────────────────────────────
    // CORE: Consume one remote producer
    // ─────────────────────────────────────────
    const consumeOne = useCallback(async ({ producerId, userId: producerUserId, kind, source }) => {
        // Skip if already consumed
        if (consumedProducers.current.has(producerId)) {
            console.warn('⚠️ Already consuming:', producerId);
            return;
        }

        if (!recvTransportRef.current || !deviceRef.current) {
            console.warn('⚠️ Recv transport not ready');
            return;
        }

        try {
            consumedProducers.current.add(producerId);

            await new Promise((resolve, reject) => {
                socket.emit('consume', {
                    producerId,
                    rtpCapabilities: deviceRef.current.rtpCapabilities,
                    transportId: recvTransportRef.current.id,
                    roomId,
                    userId: authUser._id,
                }, async (res) => {
                    if (res?.error) {
                        consumedProducers.current.delete(producerId);
                        return reject(new Error(res.error));
                    }

                    try {
                        const consumer = await recvTransportRef.current.consume({
                            id: res.id,
                            producerId: res.producerId,
                            kind: res.kind,
                            rtpParameters: res.rtpParameters,
                        });

                        consumersRef.current.set(consumer.id, consumer);

                        // Resume playback
                        socket.emit('resumeConsumer', {
                            consumerId: consumer.id, roomId, userId: authUser._id,
                        }, (r) => { if (r?.error) console.error('Resume error:', r.error); });

                        const stream = new MediaStream([consumer.track]);

                        console.log(`📥 Consuming ${kind} from ${producerUserId}`);

                        setRemoteStreams((prev) => {
                            const next = new Map(prev);
                            next.set(producerId, {
                                stream, kind,
                                source: source || 'unknown',
                                producerId,
                                userId: producerUserId,
                            });
                            return next;
                        });

                        setParticipants((prev) =>
                            prev.includes(producerUserId) ? prev : [...prev, producerUserId]
                        );

                        consumer.on('transportclose', () => {
                            setRemoteStreams((prev) => {
                                const next = new Map(prev);
                                next.delete(producerId);
                                return next;
                            });
                            consumedProducers.current.delete(producerId);
                        });

                        resolve();
                    } catch (err) {
                        consumedProducers.current.delete(producerId);
                        reject(err);
                    }
                });
            });
        } catch (err) {
            console.error('❌ consumeOne error:', err);
        }
    }, [roomId, authUser, socket]);

    // ─────────────────────────────────────────
    // Socket listeners
    // ─────────────────────────────────────────
    const setupListeners = useCallback(() => {
        socket.off('newProducer');
        socket.off('userLeftVideoCall');

        socket.on('newProducer', ({ producerId, userId: producerUserId, kind, source }) => {
            console.log(`📡 newProducer: ${kind} from ${producerUserId}`);
            consumeOne({ producerId, userId: producerUserId, kind, source });
        });

        socket.on('userLeftVideoCall', ({ userId: leftUserId }) => {
            console.log('👋 User left:', leftUserId);
            setParticipants((prev) => prev.filter((id) => id !== leftUserId));
            setRemoteStreams((prev) => {
                const next = new Map();
                prev.forEach((val, key) => {
                    if (val.userId !== leftUserId) next.set(key, val);
                });
                return next;
            });
        });
    }, [consumeOne, socket]);

    // ─────────────────────────────────────────
    // MAIN INIT
    // ─────────────────────────────────────────
    const init = async () => {
        if (initializedRef.current) {
            console.log(' Already initialized, skipping');
            return;
        }
        initializedRef.current = true;
        try {
            console.log('🎥 Initializing mediasoup room:', roomId);

            // 1. Join → capabilities + existing producers
            const { rtpCapabilities, existingProducers = [] } = await joinRoom();

            // 2. Load device
            const device = await loadDevice(rtpCapabilities);

            // 3. Both transports
            await createSendTransport(device);
            await createRecvTransport(device);

            // 4. Our camera/mic
            await startLocalMedia();

            // 5. Future producer events
            setupListeners();

            // ✅ 6. CRITICAL FIX: Consume ALL existing producers right now
            if (existingProducers.length > 0) {
                console.log(`🔄 Consuming ${existingProducers.length} existing producers...`);
                await Promise.all(existingProducers.map((p) => consumeOne(p)));
                console.log('✅ All existing producers consumed');
            }

            setConnectionState('connected');
            console.log('✅ Mediasoup fully initialized');

        } catch (error) {
            console.error(' Mediasoup init failed:', error);
            setConnectionState('failed');
        }
    };

    // ─────────────────────────────────────────
    // Controls
    // ─────────────────────────────────────────
    const toggleVideo = useCallback(() => {
        const track = localStreamRef.current?.getVideoTracks()[0];
        if (track) { track.enabled = !track.enabled; setIsVideoEnabled(track.enabled); }
    }, []);

    const toggleAudio = useCallback(() => {
        const track = localStreamRef.current?.getAudioTracks()[0];
        if (track) { track.enabled = !track.enabled; setIsAudioEnabled(track.enabled); }
    }, []);

    const startScreenShare = useCallback(async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: 'always' } });
            const screenTrack = screenStream.getVideoTracks()[0];
            const sp = await sendTransportRef.current.produce({
                track: screenTrack,
                appData: { source: 'screen', userId: authUser._id },
            });
            producersRef.current.set('screen', sp);
            setIsScreenSharing(true);
            screenTrack.onended = stopScreenShare;
        } catch (err) {
            console.error('❌ Screen share failed:', err);
        }
    }, [authUser]);

    const stopScreenShare = useCallback(() => {
        const sp = producersRef.current.get('screen');
        if (sp) { sp.close(); producersRef.current.delete('screen'); setIsScreenSharing(false); }
    }, []);

    // ─────────────────────────────────────────
    // Cleanup
    // ─────────────────────────────────────────
    const cleanup = useCallback(() => {
        console.log('🧹 Cleaning up mediasoup...');
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        producersRef.current.forEach((p) => { try { p.close(); } catch (_) { } });
        consumersRef.current.forEach((c) => { try { c.close(); } catch (_) { } });
        try { sendTransportRef.current?.close(); } catch (_) { }
        try { recvTransportRef.current?.close(); } catch (_) { }
        socket?.off('newProducer');
        socket?.off('userLeftVideoCall');
        // socket?.emit('leaveVideoCall', { roomId, userId: authUser?._id });
        consumedProducers.current.clear();
        initializedRef.current = false;
    }, [roomId, authUser, socket]);

    return {
        localStream, remoteStreams, participants,
        isVideoEnabled, isAudioEnabled, isScreenSharing, connectionState,
        toggleVideo, toggleAudio, startScreenShare, stopScreenShare,
    };
};