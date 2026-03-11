import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../../API.js';
import { useAuthStore } from './useAuthStore.js';


export const useVideoCallStore = create((set, get) => ({

    incomingCall: null,
    outgoingCall: null,
    activeCall: null,
    incomingGroupCall: null,
    callHistory: [],
    isHistoryLoading: false,

    //START

    initiateCall: async (callType, receiverId = null, groupId = null, receiverInfo = null) => {
        try {
            // const { user } = useAuthStore.getState();
            const { authUser } = useAuthStore.getState();
            const body = { callType }

            if (callType === "direct") {
                body.receiverId = receiverId;
            } if (callType === "group") {
                body.groupId = groupId;
            }

            console.log("Sending body:", body);
            const res = await axiosInstance.post("/calls/initiate", body);
            const { callId, roomName, token, wsUrl } = res.data;

            set({
                outgoingCall: {
                    callId,
                    roomName,
                    callId,
                    receiver: receiverInfo || { _id: receiverId, Fullname: "Unknown" },
                },

                activeCall: {
                    callId,
                    roomName,
                    token,
                    wsUrl,
                    isInitiator: true,
                },
            })

            const socket = useAuthStore.getState().socket;
            socket.emit("startMissedCallTimer", {
                callId,
                callType,
                senderId: authUser.id,
                receiverId: callType === "direct" ? receiverId : null,
                groupId: callType === "group" ? groupId : null,
            })

        } catch (error) {
            console.log("Error initiating call Store:", error);
            toast.error("Failed to initiate call. Please try again.");
        }
    },

    acceptCall: async () => {
        const { incomingCall } = get()
        if (!incomingCall) { return }

        try {
            const res = await axiosInstance.post("/calls/accept", {
                callId: incomingCall.callId,
            });
            const { roomName, token, wsUrl } = res.data;
            set({
                activeCall: {
                    callId: incomingCall.callId, roomName, token, wsUrl, isInitiator: false,
                },
                incomingCall: null
            })
        } catch (error) {
            console.log("Error accepting call:", error);
            toast.error("Failed to accept call.");
            set({ incomingCall: null });
        }
    },


    declineCall: async () => {
        const { incomingCall } = get();
        if (!incomingCall) { return }
        try {
            const res = await axiosInstance.post("/calls/decline", { callId: incomingCall.callId }
            );
            set({ incomingCall: null });
        } catch (error) {
            console.log("Error declining call:", error);
            toast.error("Failed to decline call.");
        } finally {
            set({ incomingCall: null });
        }
    },

    cancelCall: async () => {
        const { outgoingCall } = get();
        if (!outgoingCall) { return }

        try {
            const res = await axiosInstance.post("/calls/cancel", { callId: outgoingCall.callId }
            );


        } catch (error) {
            console.log("Error canceling call:", error);
            toast.error("Failed to cancel call.");
        }
        finally {
            set({ outgoingCall: null });
            set({ activeCall: null });
        }
    },


    endCall: async () => {
        const { activeCall } = get()
        if (!activeCall) {
            return;
        }

        try {
            const res = await axiosInstance.post("/calls/end", { callId: activeCall.callId }
            );
            set({ activeCall: null });
            set({ outgoingCall: null });
        } catch (error) {
            console.log("Error ending call:", error);
            toast.error("Failed to end call.");
        }
    },


    getCallHistory: async () => {
        set({ isHistoryLoading: true });
        try {
            const res = await axiosInstance.get("/calls/history");

            set({ callHistory: res.data });
        } catch (error) {
            console.log("Error fetching call history:", error);
            toast.error("Failed to load call history.");
        }
        finally {
            set({ isHistoryLoading: false });
        }
    },


    subscribeToCallEvents: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.on("incomingCall", (data) => {
            set({ incomingCall: data });
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("Incoming Video Call", {
                    body: `${data.caller?.Fullname || "Someone"} is calling...`,
                    icon: data.caller?.profilePic || "/avatar.png",
                });
            }
        });

        socket.on("incomingGroupCall", (data) => {
            set({ incomingCall: data }); // FIX: use incomingCall not incomingGroupCall
        });

        socket.on("callAccepted", (data) => {
            set({ outgoingCall: null }); // FIX: don't clear activeCall
            toast.success(`${data.acceptedBy?.Fullname || "They"} joined the call`);
        });

        socket.on("callDeclined", (data) => {
            set({ outgoingCall: null, activeCall: null, incomingCall: null });
            toast(`${data.declinedBy?.Fullname || "They"} declined the call`, { icon: "📵" });
        });

        // FIX: backend sends no data — removed data.callerName
        socket.on("callCancelled", () => {
            set({ incomingCall: null });
            toast("Call was cancelled", { icon: "📵" });
        });

        socket.on("callEnded", (data) => {
            set({ activeCall: null, outgoingCall: null, incomingCall: null });
            if (data?.endedBy?.Fullname) {
                toast(`${data.endedBy.Fullname} ended the call`, { icon: "📞" });
            }
        });

        // FIX: no parameter — backend sends nothing useful
        socket.on("callMissed", () => {
            set({ incomingCall: null, outgoingCall: null, activeCall: null });
            toast("Call not answered", { icon: "📵" });
        });

        socket.on("participantLeft", () => {
            toast("Someone left the call", { icon: "👋" });
        });
    },

    unsubscribeFromCallEvents: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.off("incomingCall");
        socket.off("incomingGroupCall");
        socket.off("callAccepted");
        socket.off("callDeclined");
        socket.off("callCancelled");
        socket.off("callEnded");
        socket.off("callMissed");
        socket.off("participantLeft");
    },

    resetCallState: () => {
        set({
            incomingCall: null,
            outgoingCall: null,
            activeCall: null,
        });
    },

}))