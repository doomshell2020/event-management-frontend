import axios from "axios";

// Create an axios instance
const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL, // Base URL
    headers: {
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY, // Default API key
        "Content-Type": "application/json",
    },
});

// Optional: Add interceptors (for logging, token, errors, etc.)
axiosInstance.interceptors.request.use(
    (config) => {
        // Example: attach auth token if you have one
        // const token = localStorage.getItem("token");
        // if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default axiosInstance;
