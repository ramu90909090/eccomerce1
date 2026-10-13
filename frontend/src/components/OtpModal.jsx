import React, { useState, useEffect } from "react";
import { ShieldCheck, RotateCcw, ArrowRight } from "lucide-react";

export default function OtpModal({ email, purpose, onVerify, onResend }) {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes = 180 seconds
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleResend = () => {
    onResend();
    setTimeLeft(180);
    setCanResend(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-100 text-center space-y-4">
        <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="font-extrabold text-lg text-gray-900">OTP Verification</h3>
        <p className="text-xs text-gray-500">
          6-digit verification code sent to <br />
          <strong className="text-gray-800">{email}</strong>
        </p>

        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="000000"
          className="w-full text-center text-2xl font-mono tracking-widest py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
        />

        <div className="text-xs font-semibold text-gray-500">
          {timeLeft > 0 ? (
            <span>Expires in: <strong className="text-pink-600">{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</strong></span>
          ) : (
            <span className="text-red-500">OTP Expired! Please request a new one.</span>
          )}
        </div>

        <button
          onClick={() => onVerify(otp)}
          disabled={otp.length !== 6 || timeLeft <= 0}
          className="w-full py-3 bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider disabled:opacity-50"
        >
          Verify & Proceed
        </button>

        <div className="pt-2">
          <button
            onClick={handleResend}
            disabled={!canResend}
            className="text-xs font-bold text-pink-600 disabled:text-gray-400 flex items-center justify-center space-x-1 mx-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Resend OTP</span>
          </button>
        </div>
      </div>
    </div>
  );
}