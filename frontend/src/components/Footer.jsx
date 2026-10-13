import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Send,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setIsSubscribed(true);
    setTimeout(() => {
      setIsSubscribed(false);
      setNewsletterEmail("");
    }, 3500);
  };

  return (
    <footer className="relative mt-24 bg-slate-950 text-slate-300 overflow-hidden border-t border-slate-800/80">
      
      {/* 1. Ambient Background Glowing Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 2. Top Trust & Guarantees Strip */}
      <div className="relative border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20 group-hover:scale-110 transition-transform duration-300">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Free Express Delivery</h4>
                <p className="text-[11px] text-slate-400">All India over ₹499</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">100% Genuine Items</h4>
                <p className="text-[11px] text-slate-400">Direct Brand Warranty</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform duration-300">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">7-Day Free Returns</h4>
                <p className="text-[11px] text-slate-400">No questions asked</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Dedicated Support</h4>
                <p className="text-[11px] text-slate-400">24/7 Fast assistance</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. Main Footer Columns */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Brand Col (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-pink-500 to-amber-400 p-[2px] shadow-lg shadow-pink-500/30 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-pink-400 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-violet-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                  KHASTORE
                </span>
                <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase -mt-1">
                  Premium Deals 2026
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Direct factory pricing aur authentic lifestyle & electronic gadgets ka India ka leading online hub. High quality, instant pan-India dispatch ke sath.
            </p>

            {/* Social Icons with Smooth Lift & Glow */}
            <div className="flex items-center space-x-2.5 pt-2">
              {/* Instagram */}
              <a
                href="#instagram"
                aria-label="Instagram"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-violet-600 hover:border-transparent hover:shadow-lg hover:shadow-pink-500/25 hover:-translate-y-1 transition-all duration-300"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* Twitter / X */}
              <a
                href="#twitter"
                aria-label="Twitter X"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="#youtube"
                aria-label="YouTube"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-600 hover:border-transparent hover:shadow-lg hover:shadow-red-600/30 hover:-translate-y-1 transition-all duration-300"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-pink-400">Quick Links</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/" className="hover:text-pink-400 transition-colors inline-flex items-center space-x-1 group">
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-pink-400 group-hover:translate-x-1 transition-transform" />
                  <span>Home Page</span>
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-pink-400 transition-colors inline-flex items-center space-x-1 group">
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-pink-400 group-hover:translate-x-1 transition-transform" />
                  <span>All Products</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-pink-400 transition-colors inline-flex items-center space-x-1 group">
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-pink-400 group-hover:translate-x-1 transition-transform" />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-pink-400 transition-colors inline-flex items-center space-x-1 group">
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-pink-400 group-hover:translate-x-1 transition-transform" />
                  <span>Contact Us</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Support & Headquarters (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400">Customer Desk</h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <span>Hazratganj, Lucknow, UP - 226001</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-pink-400 shrink-0" />
                <a href="tel:+919876543210" className="hover:text-white transition">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="mailto:support@khastore.com" className="hover:text-white transition">
                  support@khastore.com
                </a>
              </li>
            </ul>
          </div>

          {/* Interactive Newsletter Box (3 cols) */}
          <div className="lg:col-span-3 space-y-3 bg-gradient-to-br from-slate-900/90 to-slate-900/40 p-5 rounded-3xl border border-slate-800 backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Exclusive Offers</h3>
            <p className="text-[11px] text-slate-400">
              Festive discounts aur new drops ki instant notifications payein.
            </p>

            {isSubscribed ? (
              <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 p-3 rounded-2xl text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Subscribed! Check your inbox soon.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 text-white rounded-xl px-3.5 py-2 text-xs outline-none transition"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-pink-500/20 active:scale-95 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Subscribe Now</span>
                </button>
              </form>
            )}
          </div>

        </div>

        {/* 4. Bottom Legal, Payment Modes & Heart Notice */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 KHASTORE. All rights reserved.</p>

          <p className="flex items-center space-x-1 text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current animate-pulse" />
            <span>for direct Indian shoppers</span>
          </p>

          {/* Secure Payment Mode Badges */}
          <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400">
            <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded-md">UPI</span>
            <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded-md">VISA</span>
            <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded-md">MasterCard</span>
            <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded-md">COD</span>
          </div>
        </div>
      </div>

    </footer>
  );
}