import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Compass,
  ArrowLeft,
  Home,
  ShoppingBag,
  Sparkles,
  Search
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";

export default function NotFound() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const storeName = settings?.navbar?.brandName || "KHASTORE";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 relative overflow-hidden bg-gradient-to-br from-violet-50 via-pink-50/40 to-amber-50/40 select-none">
      {/* Background Ambient Glows */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-violet-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-xl w-full bg-white/80 backdrop-blur-2xl border border-white p-8 sm:p-12 rounded-3xl shadow-2xl shadow-pink-500/10 text-center space-y-6 animate-in zoom-in-95 duration-300">
        {/* Animated Badge & Icon */}
        <div className="relative inline-block">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-violet-600 via-pink-500 to-amber-400 p-[2px] shadow-xl shadow-pink-500/25 mx-auto">
            <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center">
              <Compass className="w-12 h-12 text-pink-600 animate-spin" style={{ animationDuration: "12s" }} />
            </div>
          </div>
          <span className="absolute -bottom-2 -right-2 bg-gradient-to-r from-violet-600 to-pink-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md">
            Lost Path
          </span>
        </div>

        {/* Heading & Notice */}
        <div className="space-y-2">
          <h1 className="text-6xl sm:text-7xl font-black tracking-tight bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Oops! Yeh Page Maujood Nahi Hai
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            Aapne jo URL enter kiya hai ya to wo galat hai ya fir yeh page hata diya gaya hai. Chinta na karein, aapka cart aur account surakshit hai.
          </p>
        </div>

        {/* Quick Search Shortcut Box */}
        <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100 flex items-center space-x-2 text-xs text-gray-400 max-w-md mx-auto">
          <Search className="w-4 h-4 text-pink-500 shrink-0 ml-1" />
          <span className="text-gray-600 font-semibold truncate">
            Looking for something specific in {storeName}?
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Peeche Jayein</span>
          </button>

          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-pink-500/25 flex items-center justify-center space-x-2 transition active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Store Home</span>
          </Link>

          <Link
            to="/products"
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-pink-600" />
            <span>Products</span>
          </Link>
        </div>
      </div>
    </div>
  );
}