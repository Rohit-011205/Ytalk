import { Server } from "socket.io"
import http from "http"
import express from "express"
// import videoCallManager from "./videoCallManager.js"
import VideoCall from "../Models/video-call.model.js"

const app = express()

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"]

    },
})

const userSocketMap = {};

// export function getReceiverSocketId(userId) {
//     return userSocketMap[userId]
// }

export function getReceiverSocketId(userId) {
    return userSocketMap[userId]
        ? Array.from(userSocketMap[userId])
        : [];
}
export const emitToUser = (userId, event, data) => {
    const socketIds = getReceiverSocketId(userId);
    if (socketIds.length > 0) {
        socketIds.forEach(socketId => {
            io.to(socketId).emit(event, data);
        });
        console.log(`📤 Emitted ${event} to user ${userId} (${socketIds.length} sockets)`);
    } else {
        console.log(`⚠️ No sockets found for user ${userId}`);
    }
};


io.on("connection", (socket) => {
    console.log("New client connected", socket.id);

    const userId = socket.handshake.query.userId;

    // if (userId) {
    //     userSocketMap[userId] = socket.id;
    // }
    if (userId) {
        if (!userSocketMap[userId]) {
            userSocketMap[userId] = new Set();
        }
        userSocketMap[userId].add(socket.id);
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("joinGroup", (groupId) => {
        socket.join(`group-${groupId}`)
        console.log(`User joined group ${groupId}`);

        io.to(`group-${groupId}`).emit("userJoinedGroup", { userId });
    })

    socket.on("leaveGroup", (groupId) => {
        socket.leave(`group-${groupId}`);
        console.log(`User left group ${groupId}`);
        io.to(`group-${groupId}`).emit("userLeftGroup", { userId });
    })

    //MISSED CALL TIMER

    socket.on("startMissedCallTimer", ({ callId, callType, receiverId, groupId }) => {
        setTimeout(async () => {
            try {
                const call = await VideoCall.findById(callId);
                if (call && call.status === "ringing") {
                    call.status = "missed";
                    call.endedAt = new Date();
                    await call.save();

                    emitToUser(call.initiatedBy, "callMissed", { callId });

                    if (callType === "direct") {
                        emitToUser(receiverId, "callMissed", { callId });
                    } else {
                        const group = await Group.findById(groupId).populate("members", "_id");
                        if (group) {
                            group.members.forEach(m => {
                                if (m._id.toString() !== call.initiatedBy.toString()) {
                                    emitToUser(m._id, "callMissed", { callId });
                                }
                            });
                        }
                    }
                }
            } catch (err) {
                console.error("Missed call timer error:", err.message);
            }
        }, 30000);
    });


    socket.on("disconnect", async () => {
        console.log("❌ Disconnected:", socket.id);

        if (userId && userSocketMap[userId]) {
            userSocketMap[userId].delete(socket.id);

            if (userSocketMap[userId].size === 0) {
                delete userSocketMap[userId];

                // Auto-cancel ringing calls if caller disconnects
                try {
                    const activeCalls = await VideoCall.find({
                        initiatedBy: userId,
                        status: "ringing",
                    });
                    for (const call of activeCalls) {
                        call.status = "cancelled";
                        call.endedAt = new Date();
                        await call.save();
                        if (call.callType === "direct" && call.receiverId) {
                            emitToUser(call.receiverId, "callCancelled", { callId: call._id });
                        }
                    }
                } catch (err) {
                    console.error("Disconnect cleanup error:", err.message);
                }
            }
        }

        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });


    // VIDEO CALLING FROM HERE -->>

    //     socket.on("joinVideoCall", async ({ roomId, userId }, callback) => {
    //         try {
    //             console.log(`User ${userId} is joining room ${roomId}`)
    //             let room = videoCallManager.getRoom(roomId)
    //             if (!room) {
    //                 room = await videoCallManager.createRoom(roomId);
    //             }

    //             videoCallManager.addPeer(roomId, userId)

    //             const rtpCapabilities = room.router.rtpCapabilities;

    //             socket.join(`video-${roomId}`)

    //             const existingProducers = [];
    //             room.peers.forEach((peer, peerId) => {
    //                 if (peerId === userId) return; // skip self
    //                 peer.producers.forEach((producer) => {
    //                     existingProducers.push({
    //                         producerId: producer.id,
    //                         userId: peerId,
    //                         kind: producer.kind,
    //                         source: producer.appData?.source,
    //                     });
    //                 });
    //             });

    //             socket.to(`video-${roomId}`).emit("userJoinedVideoCall", { userId })

    //             if (typeof callback === 'function') {
    //                 callback({
    //                     rtpCapabilities: room.router.rtpCapabilities,
    //                     existingProducers,
    //                 });
    //             }

    //         } catch (error) {
    //             console.log("Error in Socket joinVideocall: ", error.message)
    //             // callback({ error: error.message });
    //             if (callback && typeof callback === "function") {
    //                 callback({ error: error.message });
    //             }

    //         }
    //     })



    //     socket.on("createProducerTransport", async ({ roomId, userId }, callback) => {
    //         try {


    //             let room = videoCallManager.getRoom(roomId)
    //             if (!room) {
    //                 room = await videoCallManager.createRoom(roomId);
    //             }

    //             videoCallManager.addPeer(roomId, userId);

    //             const transportData = await videoCallManager.createWebRtcTransport(roomId, userId)
    //             // const room = videoCallManager.createRoom(roomId)
    //             const finalRoom = videoCallManager.getRoom(roomId);  // ← NEW ROOM REF!
    //             const peer = finalRoom.peers.get(userId);

    //             if (!peer) {
    //                 throw new Error(`Peer ${userId} not found`);
    //             }

    //             peer.transports.set(transportData.id, transportData.transport)

    //             callback && callback({
    //                 id: transportData.id,
    //                 iceParameters: transportData.iceParameters,
    //                 iceCandidates: transportData.iceCandidates,
    //                 dtlsParameters: transportData.dtlsParameters,
    //                 transports: [],
    //             });


    //         } catch (error) {
    //             // callback({ error: error.message });
    //             if (callback && typeof callback === "function") {
    //                 callback({ error: error.message });
    //             }
    //             console.log("Error in creating Producer transport Socket:", error.message);
    //         }

    //     })

    //     socket.on("createConsumerTransport", async ({ roomId, userId }, callback) => {
    //         try {
    //             let room = videoCallManager.getRoom(roomId);
    //             if (!room) {
    //                 room = await videoCallManager.createRoom(roomId);
    //             }

    //             videoCallManager.addPeer(roomId, userId);

    //             room = videoCallManager.getRoom(roomId);

    //             const transportData = await videoCallManager.createWebRtcTransport(roomId, userId);

    //             // const room = videoCallManager.getRoom(roomId);
    //             // const peer = room.peers.get(userId);
    //             const peer = room.peers.get(userId);

    //             if (!peer) {
    //                 throw new Error(`Peer ${userId} not found after addPeer`);
    //             }

    //             peer.transports.set(transportData.id, transportData.transport);
    //             callback({
    //                 id: transportData.id,
    //                 iceParameters: transportData.iceParameters,
    //                 iceCandidates: transportData.iceCandidates,
    //                 dtlsParameters: transportData.dtlsParameters,
    //                 transports: [],
    //             });
    //         } catch (error) {
    //             // callback({ error: error.message });
    //             if (callback && typeof callback === "function") {
    //                 callback({ error: error.message });
    //             }
    //             console.log("Error in creating Consumer transport Socket", error.message);
    //         }
    //     });

    //     socket.on("connectTransport", async ({ transportId, dtlsParameters, roomId, userId }, callback) => {
    //         try {
    //             const room = videoCallManager.getRoom(roomId);
    //             if (!room) throw new Error('Room not found');

    //             const peer = room.peers.get(userId);
    //             if (!peer) throw new Error(`Peer ${userId} not found`);

    //             const transport = peer.transports.get(transportId);
    //             if (!transport) throw new Error(`Transport ${transportId} not found`);

    //             await transport.connect({ dtlsParameters });
    //             console.log('✅ Transport connected:', transportId);;

    //             await transport.connect({ dtlsParameters });
    //             if (callback) callback({ connected: true });
    //         } catch (error) {
    //             // callback({ error: error.message });
    //             if (callback && typeof callback === "function") {
    //                 callback({ error: error.message });
    //             }
    //         }
    //     });

    //     socket.on("produce", async ({ transportId, kind, rtpParameters, roomId, userId, appData }, callback) => {
    //         try {
    //             const room = videoCallManager.getRoom(roomId);
    //             // const room = videoCallManager.createRoom(roomId);
    //             const peer = room.peers.get(userId)
    //             const transport = peer.transports.get(transportId);

    //             if (!room || !peer || !transport) {
    //                 throw new Error("Invalid room / peer / transport");
    //             }


    //             const producer = await transport.produce({
    //                 kind,
    //                 rtpParameters,
    //                 appData,
    //             });

    //             peer.producers.set(producer.id, producer);

    //             socket.to(`video-${roomId}`).emit("newProducer", {
    //                 producerId: producer.id,
    //                 userId,
    //                 kind,
    //                 source: appData.source,
    //             })

    //             callback({ id: producer.id });

    //         } catch (error) {
    //             console.log("Error in Produce socket", error.message);
    //             // callback({ error: error.message });
    //             if (callback && typeof callback === "function") {
    //                 callback({ error: error.message });
    //             }
    //         }
    //     })

    //     socket.on("consume", async ({ producerId, rtpCapabilities, transportId, roomId, userId }, callback) => {
    //         try {
    //             const room = videoCallManager.getRoom(roomId);
    //             if (!room) throw new Error("Room not found");

    //             const peer = room.peers.get(userId)
    //             const transport = peer.transports.get(transportId);

    //             if (!room.router.canConsume({ producerId, rtpCapabilities })) {
    //                 return callback({ error: 'cannot consume' })
    //             }

    //             const consumer = await transport.consume({
    //                 producerId,
    //                 rtpCapabilities,
    //                 paused: true, // Start paused, client will resume
    //             });

    //             peer.consumers.set(consumer.id, consumer);

    //             callback({
    //                 id: consumer.id,
    //                 producerId,
    //                 kind: consumer.kind,
    //                 rtpParameters: consumer.rtpParameters,
    //             })
    //         } catch (error) {
    //             // callback({ error: error.message });
    //             if (callback && typeof callback === "function") {
    //                 callback({ error: error.message });
    //             }
    //         }
    //     })

    //     socket.on("resumeConsumer", async ({ consumerId, roomId, userId }, callback) => {
    //         try {
    //             const room = videoCallManager.getRoom(roomId);
    //             if (!room) throw new Error("Room not found");

    //             const peer = room.peers.get(userId);
    //             if (!peer) throw new Error("Peer not found");

    //             const consumer = peer.consumers.get(consumerId);
    //             if (!consumer) throw new Error("Consumer not found");

    //             await consumer.resume();

    //             if (typeof callback === "function") {
    //                 callback({ resumed: true });
    //             }
    //         } catch (error) {
    //             console.log("Error in resumeConsiumer Socket : ", error.message)
    //             // callback({ error: error.message })
    //             if (callback && typeof callback === "function") {
    //                 callback({ error: error.message });
    //             }
    //         }
    //     })

    //     socket.on("leaveVideoCall", async ({ roomId, userId }) => {
    //         console.log(` User ${userId} leaving call ${roomId}`);
    //         // videoCallManager.removePeer(roomId, userId);
    //         // socket.to(`video-${roomId}`).emit("userLeftVideoCall", { userId });
    //         // socket.leave(`video-${roomId}`);
    //         if (room) {
    //             const peer = room.peers.get(userId);
    //             if (peer && (peer.transports.size === 0 && peer.producers.size === 0)) {
    //                 // Only remove if no active transports/producers
    //                 videoCallManager.removePeer(roomId, userId);
    //                 console.log(`✅ Peer fully cleaned: ${userId}`);
    //             } else {
    //                 console.log(`⚠️ Peer has transports/producers, keeping alive: ${userId}`);
    //             }
    //         }
    //         socket.to(`video-${roomId}`).emit("userLeftVideoCall", { userId });
    //     socket.leave(`video-${roomId}`);
    //     });

    //     socket.on("disconnect", () => {
    //         console.log("Client disconnected", socket.id);

    //         // delete userSocketMap[userId];
    //         if (userId && userSocketMap[userId]) {
    //             userSocketMap[userId].delete(socket.id);

    //             // Remove user only if all sockets closed
    //             if (userSocketMap[userId].size === 0) {
    //                 delete userSocketMap[userId];
    //             }
    //         }

    //         io.emit("getOnlineUsers", Object.keys(userSocketMap));
    //     })

})



export { io, server, app }