import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  KeyRound,
  Mail,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Send,
  AlertCircle
} from "lucide-react";
import API from "../api/axios";
import OtpModal from "../components/OtpModal";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // Step 1: Send Forgot Password OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Naya password kam se kam 6 characters ka hona chahiye.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/forgot-password", { email });
      if (res.data.success) {
        setShowOtpModal(true);
      }
    } catch (err) {
      setError(err.message || "Email not found");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and save new password
  const handleVerifyAndReset = async (otp) => {
    try {
      const res = await API.post("/auth/reset-password", {
        email,
        otp,
        newPassword
      });
      if (res.data.success) {
        setShowOtpModal(false);
        setIsSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      alert(err.message || "Password reset failed. Invalid OTP.");
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    try {
      await API.post("/auth/resend-otp", { email, purpose: "forgot_password" });
      alert("Naya Reset OTP aapke email par bhej diya gaya!");
    } catch (err) {
      alert(err.message || "Resend failed");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-gradient-to-br from-violet-50 via-pink-50/50 to-amber-50/40">
      <div className="relative w-full max-w-md bg-white/85 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-pink-500/10 text-center">
        
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-500 to-violet-600 text-white shadow-lg shadow-pink-500/30 mb-4">
          <KeyRound className="w-7 h-7" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Reset Password
        </h2>
        <p className="text-xs text-gray-500 mt-2 mb-6">
          Registered email aur naya password enter karein, hum OTP verify karke password update kar denge.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center space-x-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl space-y-2 animate-in zoom-in-95">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-extrabold text-sm">Password Updated!</h4>
            <p className="text-xs text-emerald-700">Login page par redirect kiya ja raha hai...</p>
          </div>
        ) : (
          <form onSubmit={handleRequestOtp} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 rounded-2xl text-xs font-semibold outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 rounded-2xl text-xs font-semibold outline-none transition"
                />
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
                  <Send className="w-4 h-4" />
                  <span>Send OTP & Reset</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100">
          <Link
            to="/login"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-600 hover:text-pink-600 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>

      {/* 3-Minute Forgot Password OTP Verification Modal */}
      {showOtpModal && (
        <OtpModal
          email={email}
          purpose="forgot_password"
          onVerify={handleVerifyAndReset}
          onResend={handleResendOtp}
        />
      )}
    </div>
  );
}