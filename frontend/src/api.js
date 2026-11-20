import axios from "axios";

// Base API URL from environment variable or dynamic unified single-origin fallback
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== "undefined") {
    // If running on unified server (port 5000) or public production domain, use relative /api
    if (
      window.location.port === "5000" ||
      (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1")
    ) {
      return "/api";
    }
  }
  return "http://localhost:5000/api";
};

const API_URL = getBaseUrl();

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
