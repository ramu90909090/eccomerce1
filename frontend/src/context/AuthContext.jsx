import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Safe initial state evaluation (Prevents "undefined is not valid JSON" crash)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user_info");
      if (!saved || saved === "undefined" || saved === "null") {
        return null;
      }
      return JSON.parse(saved);
    } catch (err) {
      console.error("Local user parse error, clearing invalid storage:", err);
      localStorage.removeItem("user_info");
      return null;
    }
  });

  // Initial loading ko true rakha hai taaki page refresh hone par seedha redirect na ho
  const [loading, setLoading] = useState(true);

  // Sync profile & role with backend on mount / page refresh
  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const res = await API.get("/auth/profile");
        // Support both response formats: res.data.user or res.data.data
        const userData = res.data?.user || res.data?.data;

        if (res.data?.success && userData) {
          setUser(userData);
          localStorage.setItem("user_info", JSON.stringify(userData));
        } else {
          setUser(null);
          localStorage.removeItem("user_info");
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
    const userData = res.data?.user || res.data?.data;

    if (res.data?.success && userData) {
      setUser(userData);
      localStorage.setItem("user_info", JSON.stringify(userData));
    }
    return res.data;
  };

  // 3. Google OAuth Login
  const handleGoogleLogin = async (credential) => {
    const res = await API.post("/auth/google", { credential });
    const userData = res.data?.user || res.data?.data;

    if (res.data?.success && userData) {
      setUser(userData);
      localStorage.setItem("user_info", JSON.stringify(userData));
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
    const userData = res.data?.user || res.data?.data;

    if (res.data?.success && userData) {
      setUser(userData);
      localStorage.setItem("user_info", JSON.stringify(userData));
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