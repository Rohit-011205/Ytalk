import { toast } from "react-hot-toast";

import { create } from "zustand";
import { axiosInstance } from "../../API";
import { useAuthStore } from "./useAuthStore.js";
import { useMessageStore } from "./UseMessageStore";

export const useGroupStore = create((set, get) => ({

    groups: [],
    activeGroup: null,
    groupMessages: [],
    isLoading: false,
    allUsers: [],
    selectedMembers: [],

    fetchGroups: async () => {
        try {
            const res = await axiosInstance.get("/groups/my-groups");
            set({ groups: res.data });
        } catch (error) {
            console.log("error in Fetchgroups store:", error.message)
            toast.error("Failed to load groups");
        }
    },


    setActiveGroup: async (groupId) => {
        const socket = useAuthStore.getState().socket;
        const prevGroup = get().activeGroup;
        useMessageStore.getState().setSelectedUser(null);



        if (prevGroup && socket) {
            socket.emit("leaveGroup", prevGroup._id);
        }

        set({ isLoading: true });

        try {
            const res = await axiosInstance.get(`/groups/${groupId}`);
            set({ activeGroup: res.data, groupMessages: [] });

            //  JOIN NEW GROUP SOCKET ROOM
            if (socket) {
                socket.emit("joinGroup", groupId);
            }
        } catch (error) {
            console.error("Error setting active group:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchGroupMessages: async (groupId) => {
        try {
            const res = await axiosInstance.get(`/groups/${groupId}/messages`)
            set({ groupMessages: res.data });

        } catch (error) {
            console.error("Error in fetchingmessages:", error);
        }
    },

    createGroup: async (groupData) => {
        set({ isLoading: true });

        try {
            const res = await axiosInstance.post("/groups/create",
                groupData)

            set((state) => ({
                groups: [...state.groups, res.data],
                selectedMembers: [],
            }));

            const socket = useAuthStore.getState().socket;
            if (socket) {
                socket.emit("joinGroup", res.data._id);
            }

            return res.data;
        } catch (error) {
            console.error("Error in creatingingroup:", error);
            throw error;
        }
        finally {
            set({ isLoading: false });
        }


    },

    subscribeToGroupMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.on("groupMessage", (message) => {
            const activeGroup = get().activeGroup;
            if (!activeGroup) return;

            if (message.groupId !== activeGroup._id) return;

            set((state) => ({
                groupMessages: [...state.groupMessages, message],
            }));
        });
    },

    unsubscribeFromGroupMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.off("groupMessage");
    },


    fetchAllUsers: async () => {
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ allUsers: res.data });
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    },

    toggleMember: (userId) => {
        set((state) => {
            const exists = state.selectedMembers.includes(userId);

            return {
                selectedMembers: exists
                    ? state.selectedMembers.filter(id => id !== userId)
                    : [...state.selectedMembers, userId],
            };
        });
    },


    clearSelectedMembers: () => {
        set({ selectedMembers: [] });
    },

    addMessage: (message) => {
        const activeGroup = get().activeGroup
        if (!activeGroup || message.groupId !== activeGroup._id) return;

        set((state) => ({
            groupMessages: [...state.groupMessages, message]
        }))
    },

    sendGroupMessage: async (groupId, text) => {
        try {
            await axiosInstance.post(`/groups/${groupId}/send`,
                { text });
        } catch (error) {
            console.error("Error sending group message:", error);
            throw error;
        }
    },

    // Add/Update these methods in your useGroupStore.js

addMembers: async (groupId, userId) => { // Backend expects single userId in body
    try {
        const res = await axiosInstance.post(`/groups/${groupId}/add-member`, { userId });
        set({ activeGroup: res.data }); 
        toast.success("Member added to the group");
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to add member");
    }
},

removeMember: async (groupId, userId) => {
    try {
        const res = await axiosInstance.post(`/groups/${groupId}/remove-member`, { userId });
        set({ activeGroup: res.data });
        toast.success("Member removed");
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to remove member");
    }
},

// Logic for the creator/admin to delete the group
// deleteGroup: async (groupId) => {
//     try {
//         await axiosInstance.delete(`/groups/${groupId}/delete`);
//         set((state) => ({
//             groups: state.groups.filter((g) => g._id !== groupId),
//             activeGroup: null,
//             groupMessages: [],
//         }));
//         toast.success("Group deleted forever");
//     } catch (error) {
//         toast.error("Failed to delete group");
//     }
// }

    updateGroup: async (groupId, updateData) => {
        try {
            const res = await axiosInstance.put(
                `/groups/${groupId}/update`,
                updateData
            );

            set((state) => ({
                activeGroup: res.data,
                groups: state.groups.map((g) =>
                    g._id === groupId ? res.data : g
                ),
            }));
        } catch (error) {
            console.error("Error updating group:", error);
            throw error;
        }
    },

    deleteGroup: async (groupId) => {
        try {
            await axiosInstance.delete(`/groups/${groupId}/delete`);


            const socket = useAuthStore.getState().socket;
            if (socket) {
                socket.emit("leaveGroup", groupId);
            }

            set((state) => ({
                groups: state.groups.filter((g) => g._id !== groupId),
                activeGroup: null,
                groupMessages: [],
            }));
        } catch (error) {
            console.error("Error deleting group:", error);
            throw error;
        }
    },
}))