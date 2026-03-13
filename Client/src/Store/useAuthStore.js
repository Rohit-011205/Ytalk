import { create } from "zustand"
import { axiosInstance } from "../../API.js"
import { toast } from "react-hot-toast"
import { io } from "socket.io-client"
import { useVideoCallStore } from "./useVideoCall.js"

const url = ["https://ytalk-1.onrender.com/api","http://localhost:5000/api"];
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingin: false,
    isUpdatingProfile: false,
    socket: null,
    onlineUsers: [],


    isUpdatingProfile: false,
    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check")

            if (res.data && !res.data.isOnboarded && res.data.googleId) {
                set({ authUser: res.data });
                if (window.location.pathname !== "/onboarding") {
                    window.location.href = "/onboarding";
                }
                // window.location.href = "/onboarding";
                return;
            }

            set({ authUser: res.data })
            get().connectSocket();
        } catch (error) {
            if (error.response?.status !== 401) {
                console.log(error);
            }
            set({ authUser: null });
        }
        finally {
            set({ isCheckingAuth: false });
        }
    },
    signup: async (data) => {
        set({ isSigningUp: true })
        try {
            const res = await axiosInstance.post("/auth/signup", data)

            set({ authUser: res.data })
            toast.success("Account created successfully")

            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message)
            console.log("Error in signup:", error.response?.data?.message || error.message);
        }
        finally {
            set({ isSigningUp: false })
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout")
            set({ authUser: null })

            toast.success("Logged out successfully")
            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response.data.message)
            console.log("Error in logout:", error.response?.data?.message || error.message);
        }
    },

    completeOnboarding: async (data) => {
        try {
            const res = await axiosInstance.post("/auth/complete-onboarding", data)
            set({ authUser: res.data })
            toast.success("Profile setup complete! Welcome 🎉")
            get().connectSocket();
            window.location.href = "/";
        } catch (error) {
            toast.error(error.response?.data?.message || "Onboarding failed")
            console.log("Error in completeOnboarding:", error.response?.data?.message || error.message);
        }
    },


    login: async (data) => {
        set({ isLoggingin: true })
        try {
            const res = await axiosInstance.post("/auth/login", data)
            set({ authUser: res.data })
            toast.success("Logged in successfully")

            // await useAuthStore.getState().checkAuth();

            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message)
            console.log("Error in login AuthStore:", error.response?.data?.message || error.message);
        }
        finally {
            set({ isLoggingin: false })
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/updateprofile", data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("error in update profile:", error);
            toast.error(error.response?.data?.message || "Update failed");
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: () => {
        const { authUser } = get()
        if (!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
        });
        socket.connect();
        set({ socket: socket });

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds })
        })

        // socket.on("incomingCall", (callData) => {
        //     console.log("There is an Incoming Call", callData);

        //     import("./useVideoCall.js").then(({ useVideoCallStore }) => {
        //         useVideoCallStore.getState().setIncomingCall(callData);
        //     })

        //     if ('Notification' in window && Notification.permission === 'granted') {
        //         new Notification('Incoming Video Call', {
        //             body: `${callData.callerName || 'Someone'} is calling...`,
        //             icon: callData.callerAvatar || '/logo.png',
        //         });
        //     }
        // })

        // socket.on("callEnded", ({ roomId }) => {
        //     console.log("Ending this room Call", roomId);

        //     import("./useVideoCall.js").then(({ useVideoCallStore }) => {
        //         const { activeCall, clearIncomingCall } = useVideoCallStore.getState();

        //         if (activeCall?.roomId === roomId) {
        //             useVideoCallStore.setState({ activeCall: null })
        //             toast("Call ended")
        //         }

        //         clearIncomingCall();

        //     })
        // })

        // socket.on("callRejected", ({ callId, rejectedBy }) => {
        //     console.log(" Call rejected:", { callId, rejectedBy });
        //     toast("Call was declined");
        // });

        // socket.on("userJoinedVideoCall", ({ userId }) => {
        //     const videoStore = useVideoCallStore.getState();
        //     const authStore = useAuthStore.getState()

        //     if (videoStore.activeCall?.isInitiator && videoStore.activeCall?.roomId) {
        //         // Navigate to video room NOW
        //         // navigate(`/call/${roomId}`);
        //         window.location.href = `/call/${videoStore.activeCall.roomId}`;
        //         // OR if using react-router: navigate(`/call/${roomId}`);
        //     }

        //     // const {createBrowserHistory} = await import('history')
        //     // const history = createBrowserHistory();

        //     console.log(" User joined video call:", userId);
        //     toast.success("Someone joined the call");
        // });

        // socket.on("userLeftVideoCall", ({ userId }) => {
        //     console.log("User left video call:", userId);
        //     toast("Someone left the call");
        // });

        // socket.on("missedCall", (missedCallData) => {
        //     console.log(" Missed call notification:", missedCallData);

        //     import("./useVideoCall.js").then(({ useVideoCallStore }) => {
        //         useVideoCallStore.getState().handleNewMissedCall(missedCallData);
        //     });
        // });
    },

    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
    }



}
))


