import axios from "axios";

// Base API URL from environment variable or default backend port 5000
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

// Attach JWT token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("kiranas_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handler with descriptive logging and connection recovery
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with a status outside 2xx
      if (error.response.status === 401 && window.location.pathname.startsWith("/dashboard")) {
        console.warn("Session expired or token invalid.");
      }
    } else if (error.request) {
      // Request was made but no response received (Backend down or CORS issue)
      console.error(
        `[KIRANAS Network Error] Backend is unreachable at ${API_URL}. Ensure Express backend is running on http://localhost:5000.`
      );
    } else {
      console.error("[KIRANAS API Error]:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
