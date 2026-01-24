import { create } from "zustand"
import { axiosInstance } from "../../API.js"
import { toast } from "react-hot-toast"

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

export const useAuthStore = create((set) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingin: false,
    isUpdatingProfile: false,


    isUpdatingProfile: false,
    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check")

            set({ authUser: res.data })
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error(error);
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
        } catch (error) {
            toast.error(error.response.data.message)
            console.log("Error in logout:", error.response?.data?.message || error.message);
        }
    },

    login: async (data) => {
        set({ isLoggingin: true })
        try {
            const res = await axiosInstance.post("/auth/login", data)
            set({ authUser: res.data })
            toast.success("Logged in successfully")

            await useAuthStore.getState().checkAuth();
        } catch (error) {
            toast.error(error.response.data.message)
            console.log("Error in login AuthStore:", error.response?.data?.message || error.message);
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

}))

