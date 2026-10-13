import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Sparkles,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import OtpModal from "../components/OtpModal";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const { loginUser, verifyLoginOtp, handleGoogleLogin } = useAuth();
  const navigate = useNavigate();

  // Step 1: Submit Credentials & Request Login OTP
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await loginUser(email, password);
      if (res.data.success) {
        setShowOtpModal(true);
      }
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify Login OTP
  const handleVerifyOtp = async (otp) => {
    try {
      const res = await verifyLoginOtp(email, otp);
      if (res.success) {
        setShowOtpModal(false);
        navigate("/");
      }
    } catch (err) {
      alert(err.message || "OTP verification failed");
    }
  };

  // Resend Login OTP
  const handleResendOtp = async () => {
    try {
      await API.post("/auth/resend-otp", { email, purpose: "login" });
      alert("Naya Login OTP aapke email par bhej diya gaya!");
    } catch (err) {
      alert(err.message || "Resend failed");
    }
  };

  // Google OAuth Success Handler
  const onGoogleSuccess = async (credentialResponse) => {
    try {
      await handleGoogleLogin(credentialResponse.credential);
      navigate("/");
    } catch (err) {
      setError("Google Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-gradient-to-br from-violet-50 via-pink-50/50 to-amber-50/40">
      <div className="relative w-full max-w-md bg-white/85 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-pink-500/10">
        
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-violet-600 via-pink-500 to-amber-400 text-white shadow-lg shadow-pink-500/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
            Welcome Back!
          </h2>
          <p className="text-xs text-gray-500">
            KHASTORE account me log in karke 2-step verification complete karein.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google One-Click Login Button */}
        <div className="flex justify-center mb-4">
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={() => setError("Google login error")}
            shape="pill"
            theme="filled_blue"
          />
        </div>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-gray-200" />
          <span className="px-3 text-xs text-gray-400 font-bold uppercase">Or Login with Email</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 rounded-2xl text-xs font-semibold outline-none transition duration-200"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] font-bold text-pink-600 hover:text-pink-700 transition"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-2.5 bg-gray-50/80 border border-gray-200 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 rounded-2xl text-xs font-semibold outline-none transition duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-pink-500/30 active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Send Login OTP</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-600">
            Abhi tak account nahi hai?{" "}
            <Link
              to="/register"
              className="font-bold text-pink-600 hover:text-violet-600 inline-flex items-center space-x-1 ml-1 transition"
            >
              <span>Sign Up Karein</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </div>

      {/* 3-Minute Login OTP Verification Modal */}
      {showOtpModal && (
        <OtpModal
          email={email}
          purpose="login"
          onVerify={handleVerifyOtp}
          onResend={handleResendOtp}
        />
      )}
    </div>
  );
}