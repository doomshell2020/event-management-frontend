import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach correct token automatically (user/admin)
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      let token;

      // 1️⃣ Explicit header flag (recommended for clarity)
      const authType = config.headers["X-Auth-Type"];

      if (authType == "admin") {
        token = Cookies.get("adminAuthToken");
      } else if (authType == "user") {
        token = Cookies.get("userAuthToken");
      } else {
        // 2️⃣ Fallback logic by URL path
        if (config.url?.includes("/admin")) {
          token = Cookies.get("adminAuthToken");
        } else {
          token = Cookies.get("userAuthToken");
        }
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Global 401 handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status == 401) {
      const url = error.config?.url || "";

      if (url.includes("/admin")) {
        Cookies.remove("adminAuthToken");
      } else {
        Cookies.remove("userAuthToken");
      }

      console.warn("⚠️ Unauthorized: Token expired or invalid");
    }
    return Promise.reject(error);
  }
);

export default api;
