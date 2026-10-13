import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Truck,
  Award,
  HeartHandshake,
  CheckCircle,
  ArrowRight,
  Store,
  Boxes,
  Building2,
  Sparkles,
  Mail
} from "lucide-react";
import API from "../../api/axios";

const ICON_MAP = {
  Store,
  Boxes,
  Building2,
  ShieldCheck,
  Truck,
  Award,
  HeartHandshake
};

function useCounter(targetValue, start = false, duration = 1800, isDecimal = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start || !targetValue) return;

    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentVal = progress * targetValue;

      setCount(isDecimal ? parseFloat(currentVal.toFixed(1)) : Math.floor(currentVal));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [targetValue, start, duration, isDecimal]);

  return count;
}

function AnimatedStatItem({ stat, isVisible }) {
  const animatedNumber = useCounter(stat.number, isVisible, 1800, stat.isDecimal);

  return (
    <div className="group relative bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-violet-600 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      <p className="text-2xl sm:text-3xl font-black text-gray-900">
        {stat.prefix || ""}
        {stat.isDecimal ? animatedNumber.toFixed(1) : animatedNumber.toLocaleString()}
        {stat.suffix || ""}
      </p>
      <h4 className="text-xs sm:text-sm font-bold text-gray-700 mt-1">{stat.label}</h4>
      <p className="text-[11px] font-medium text-pink-600 mt-1">{stat.change}</p>
    </div>
  );
}

export default function AboutUs() {
  const [config, setConfig] = useState(null);
  const [statsInView, setStatsInView] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    API.get("/about/config")
      .then((res) => {
        if (res.data?.success) setConfig(res.data.data);
      })
      .catch((err) => console.error("About config load failed:", err));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsInView(true);
      },
      { threshold: 0.2 }
    );

    if (statsRef.current) observer.observe(statsRef.current);
    const safetyTimer = setTimeout(() => setStatsInView(true), 600);

    return () => {
      observer.disconnect();
      clearTimeout(safetyTimer);
    };
  }, []);

  if (!config) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* 1. Hero Showcase Section */}
      {config.hero?.isEnabled !== false && (
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-14 text-white shadow-2xl">
          <div className="relative z-10 max-w-4xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider border border-white/15 text-pink-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{config.hero.badge}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              {config.hero.headingPrefix} <br />
              <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                {config.hero.headingHighlight}
              </span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              {config.hero.description}
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-bold px-6 py-3 rounded-2xl text-sm shadow-lg shadow-pink-500/25 active:scale-95 transition"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-2xl text-sm border border-white/20 backdrop-blur-md transition"
              >
                <span>Contact Headquarters</span>
              </Link>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 right-20 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        </section>
      )}

      {/* 2. Live Numbers & Performance Stats */}
      {config.stats?.length > 0 && (
        <section ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {config.stats.map((stat, i) => (
            <AnimatedStatItem key={stat._id || i} stat={stat} isVisible={statsInView} />
          ))}
        </section>
      )}

      {/* 3. Physical Presence (Only Active Images Displayed) */}
      {config.infrastructure?.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
                Our Infrastructure
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
                Behind The Scenes: Shop & Modern Warehouse
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm">
              Humara operations hub aur store automated sorting aur real-time stock management follow karta hai.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {config.infrastructure.map((item, idx) => {
              const IconComp = ICON_MAP[item.icon] || Store;
              // Filter active image
              const activeImage =
                item.images?.find((img) => img.isActive)?.url ||
                item.images?.[0]?.url ||
                "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80";

              return (
                <div
                  key={item._id || idx}
                  className="group relative rounded-3xl overflow-hidden shadow-sm border border-gray-200 bg-slate-900 h-72 sm:h-80"
                >
                  <img
                    src={activeImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col justify-end text-white">
                    <div className="flex items-center space-x-2 text-pink-400 text-xs font-bold mb-1">
                      <IconComp className="w-4 h-4" />
                      <span>{item.tag}</span>
                    </div>
                    <h3 className="text-lg font-bold">{item.title}</h3>
                    <p className="text-xs text-gray-300 mt-1">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Founder / Owner Profile */}
      {config.founder?.isEnabled !== false && (
        <section className="bg-gradient-to-br from-white to-pink-50/40 p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group">
                <div className="w-64 h-72 sm:w-72 sm:h-80 rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-slate-100">
                  <img
                    src={
                      config.founder.images?.find((img) => img.isActive)?.url ||
                      config.founder.images?.[0]?.url ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80"
                    }
                    alt={config.founder.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-gray-100 shadow-lg flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">{config.founder.designation}</p>
                    <p className="text-xs font-extrabold text-gray-900">{config.founder.name}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold text-violet-600 uppercase tracking-widest bg-violet-50 px-3 py-1 rounded-full">
                Leadership Word
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-snug">
                "{config.founder.quote}"
              </h2>
              <blockquote className="text-gray-600 text-sm leading-relaxed border-l-4 border-pink-500 pl-4 italic">
                "{config.founder.visionStory}"
              </blockquote>

              <div className="pt-2 flex items-center space-x-6">
                <div>
                  <p className="font-extrabold text-gray-900 text-sm">{config.founder.name}</p>
                  <p className="text-xs text-gray-500">{config.founder.designation}, KHASTORE</p>
                </div>
                {config.founder.socials?.email && (
                  <a
                    href={`mailto:${config.founder.socials.email}`}
                    className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-pink-600 transition"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. Core Operational Pillars */}
      {config.pillars?.length > 0 && (
        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold text-pink-600 uppercase tracking-widest bg-pink-50 px-3 py-1 rounded-full">
              Our Guarantees
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
              Kyun KHASTORE par log trust karte hain?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {config.pillars.map((item, idx) => {
              const PillarIcon = ICON_MAP[item.icon] || ShieldCheck;
              return (
                <div
                  key={item._id || idx}
                  className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
                >
                  <div>
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color || "from-blue-500 to-cyan-500"} flex items-center justify-center text-white mb-4 shadow-md`}
                    >
                      <PillarIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-base text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-50 flex items-center text-xs font-bold text-gray-700">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mr-1.5" />
                    <span>Verified Standard</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. Growth Timeline */}
      {config.milestones?.length > 0 && (
        <section className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl space-y-8">
          <div className="text-center max-w-md mx-auto">
            <span className="text-xs font-bold text-pink-400 uppercase tracking-widest">Our Evolution</span>
            <h2 className="text-2xl sm:text-3xl font-black mt-1">Humara Ab Tak Ka Safar</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {config.milestones.map((m, index) => (
              <div
                key={m._id || index}
                className="relative bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl backdrop-blur-md"
              >
                <span className="text-2xl font-black bg-gradient-to-r from-pink-400 to-amber-300 bg-clip-text text-transparent">
                  {m.year}
                </span>
                <h4 className="font-bold text-base mt-2 text-white">{m.title}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Call To Action Footer */}
      {config.cta?.isEnabled !== false && (
        <section className="bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 p-8 sm:p-12 rounded-3xl text-white text-center shadow-xl space-y-4">
          <h2 className="text-2xl sm:text-4xl font-black">{config.cta.heading}</h2>
          <p className="text-xs sm:text-sm text-pink-100 max-w-xl mx-auto">{config.cta.description}</p>
          <div className="pt-2">
            <Link
              to={config.cta.buttonLink || "/products"}
              className="inline-flex items-center space-x-2 bg-white text-gray-900 hover:bg-slate-100 font-extrabold px-6 py-3 rounded-2xl text-sm shadow-md active:scale-95 transition"
            >
              <span>{config.cta.buttonText || "Start Shopping Now"}</span>
              <ArrowRight className="w-4 h-4 text-pink-600" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}