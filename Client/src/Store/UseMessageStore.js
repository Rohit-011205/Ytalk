import { create } from "zustand";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../../API.js";
import { useAuthStore } from "./useAuthStore.js";


export const useMessageStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ users: res.data });

        } catch (error) {
            toast.error(error.response.data.message);
            console.log("Error in getUsers MessageStore:", error.response?.data?.message || error.message);

        }
        finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        if (!userId || userId === "null") return;

        set({ isMessagesLoading: true });

        try {
            const res = await axiosInstance.get(`/messages/${userId}`)
            set({ messages: res.data });

        } catch (error) {
            toast.error(error.response.data.message);
            console.log("Error in getMessages MessageStore:", error.response?.data?.message || error.message);
        }
        finally {
            set({ isMessagesLoading: false });
        }
    },
    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();

        if (!selectedUser) {
            toast.error("No user selected");
            return;
        }

        try {
            // const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);

            // console.log("messages type:", Array.isArray(messages), messages);
            // console.log("sendMessage response:", res.data);

            // set({ messages: [...messages, res.data] });
            await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);

        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || "Something went wrong";
            toast.error(errorMessage);
            console.log("Error in sendMessage MessageStore:", error.response?.data?.message || error.message);
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        socket.off("newMessage")

        // const myId = useAuthStore.getState().authUser._id.toString();
        const AI_ID = import.meta.env.VITE_AI_AGENT_ID;
        // const selectedUserId = selectedUser._id.toString();


        socket.on("newMessage", (newMessage) => {
            const currentSelectedUser = get().selectedUser;
            if (!currentSelectedUser) return;

            const myId = useAuthStore.getState().authUser._id.toString();
            const selectedUserId = currentSelectedUser._id.toString();

            const senderId = newMessage.senderId?.toString();
            const receiverId = newMessage.receiverId?.toString();

            // Normal message from selected user to me
            const fromSelectedUser = senderId === selectedUserId && receiverId === myId;

            // ✅ AI reply — use isAiResponse flag, no AI_ID needed
            // receiverId can be myId (when I'm receiver) OR selectedUserId (when I'm sender)

            const isPersonalAIReply =
                newMessage.isAiResponse === true &&
                senderId === AI_ID &&
                receiverId === myId;

            // const isAIReply = newMessage.isAiResponse === true &&
            //     (
            //         (senderId === AI_ID && receiverId === myId) ||
            //         (senderId === AI_ID && receiverId === selectedUserId)
            //     );

            const expectedChatId = [myId, selectedUserId].sort().join("_");
            const isFriendChatAIReply =
                newMessage.isAiResponse === true &&
                senderId === AI_ID &&
                newMessage.chatId === expectedChatId;

            // console.log("isAiResponse:", newMessage.isAiResponse, "| receiverId:", receiverId, "| myId:", myId, "| selectedUserId:", selectedUserId, "| isAIReply:", isAIReply);

            if (!fromSelectedUser && !isPersonalAIReply && !isFriendChatAIReply) return;

            const currentMessages = get().messages;
            if (currentMessages.find(m => m._id === newMessage._id)) return;

            set((state) => ({
                messages: [...state.messages, newMessage],
            }));
        });
    },



    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },


    setSelectedUser: (selectedUser) => {
        // 1. Check the condition first
        if (!selectedUser) {
            // 2. Then call set with the 'null' state
            set({ selectedUser: null, messages: [] });
        } else {
            // 3. Or call set with the new user
            set({ selectedUser });
        }
    },

}))