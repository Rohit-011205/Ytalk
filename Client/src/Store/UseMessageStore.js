import { create } from "zustand";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../../API.js";

export const useMessageStore = create((set) => ({
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

    getMessages : async (userId) =>{
        set({ isMessagesLoading: true });

        try {
            const res = await axiosInstance.get(`/messages/${userId}`)
            set({ messages: res.data });

        } catch (error) {
            toast.error(error.response.data.message);
            console.log("Error in getMessages MessageStore:", error.response?.data?.message || error.message);
        }
    }
}))