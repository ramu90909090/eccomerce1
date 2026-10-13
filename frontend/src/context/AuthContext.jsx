import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user_info");
    return saved ? JSON.parse(saved) : null;
  });
  
  // Initial loading ko true rakha hai taaki page refresh hone par seedha redirect na ho
  const [loading, setLoading] = useState(true);

  // Sync profile & role with backend on mount / page refresh
  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const res = await API.get("/auth/profile");
        if (res.data?.success) {
          setUser(res.data.user);
          localStorage.setItem("user_info", JSON.stringify(res.data.user));
        }
      } catch (err) {
        // Token invalid ya expired hone par session clear karein
        if (err.response?.status === 401 || err.response?.status === 403) {
          setUser(null);
          localStorage.removeItem("user_info");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProfile();
  }, []);

  // 1. Initial Login Request (Sends Login OTP)
  const loginUser = async (email, password) => {
    return await API.post("/auth/login", { email, password });
  };

  // 2. Verify Login OTP & Set Session
  const verifyLoginOtp = async (email, otp) => {
    const res = await API.post("/auth/verify-login-otp", { email, otp });
    if (res.data?.success) {
      setUser(res.data.user);
      localStorage.setItem("user_info", JSON.stringify(res.data.user));
    }
    return res.data;
  };

  // 3. Google OAuth Login
  const handleGoogleLogin = async (credential) => {
    const res = await API.post("/auth/google", { credential });
    if (res.data?.success) {
      setUser(res.data.user);
      localStorage.setItem("user_info", JSON.stringify(res.data.user));
    }
    return res.data;
  };

  // 4. Safe Logout (Backend cookie + Local storage clearance)
  const logoutUser = async () => {
    try {
      await API.post("/auth/logout");
    } catch (err) {
      console.error("Backend logout error:", err);
    } finally {
      setUser(null);
      localStorage.removeItem("user_info");
      window.location.href = "/login";
    }
  };

  // 5. Update Profile Details
  const updateProfile = async (updatedData) => {
    const res = await API.put("/auth/profile", updatedData);
    if (res.data?.success) {
      setUser(res.data.user);
      localStorage.setItem("user_info", JSON.stringify(res.data.user));
    }
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        loginUser,
        verifyLoginOtp,
        handleGoogleLogin,
        logoutUser,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);