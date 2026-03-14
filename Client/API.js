import axios from "axios";

const url = ["https://ytalk-1.onrender.com/api","http://localhost:5000/api"]
export const axiosInstance = axios.create({
    baseURL:import.meta.env.VITE_BACKEND_URL + "/api",
    withCredentials: true,
})