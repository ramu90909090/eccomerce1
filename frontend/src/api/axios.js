import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  withCredentials: true, // Cookies (HttpOnly JWT) send karne ke liye zaroori hai
  headers: {
    "Content-Type": "application/json"
  }
});

// Response interceptor to format errors nicely
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const customMessage = error.response?.data?.message || "Server connection failed";
    return Promise.reject(new Error(customMessage));
  }
);

export default API;