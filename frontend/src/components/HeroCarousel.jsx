import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const slides = [
  {
    id: 1,
    title: "Next-Gen Noise Cancelling Audio",
    subtitle: "FLAT 40% OFF FESTIVE DEAL",
    desc: "Experience spatial sound clarity with all-day battery life.",
    badge: "Trending Tech",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&q=80",
    linkText: "Shop Audio",
    bgGradient: "from-slate-950/80 via-slate-900/60 to-transparent",
  },
  {
    id: 2,
    title: "Smart Fitness & AMOLED Watches",
    subtitle: "STARTING FROM ₹1,999",
    desc: "Real-time health telemetry, GPS routing and 5ATM water protection.",
    badge: "Best Seller",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&q=80",
    linkText: "Explore Wearables",
    bgGradient: "from-blue-950/80 via-indigo-950/60 to-transparent",
  },
  {
    id: 3,
    title: "Urban Streetwear & Minimal Bags",
    subtitle: "NEW ARRIVALS 2026",
    desc: "Crafted with water-resistant full-grain leather for everyday carry.",
    badge: "Fashion Drop",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1600&q=80",
    linkText: "View Collection",
    bgGradient: "from-neutral-950/80 via-stone-900/60 to-transparent",
  },
  {
    id: 4,
    title: "Mechanical Tactile Gaming Gear",
    subtitle: "PRO PERFORMANCE",
    desc: "Custom RGB backlighting, hot-swappable switches, and ultra-low latency.",
    badge: "Gamers Choice",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1600&q=80",
    linkText: "Get Yours",
    bgGradient: "from-purple-950/80 via-slate-950/60 to-transparent",
  },
  {
    id: 5,
    title: "Eco-Luxe Modern Living & Decor",
    subtitle: "UP TO 50% DISCOUNT",
    desc: "Aesthetic workspace essentials, diffuse ambience lighting, and drinkware.",
    badge: "Home Style",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1600&q=80",
    linkText: "Discover More",
    bgGradient: "from-emerald-950/80 via-teal-950/60 to-transparent",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto slide interval (4 seconds)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 2000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const prevSlide = () => {
    setCurrent(current === 0 ? slides.length - 1 : current - 1);
  };

  const nextSlide = () => {
    setCurrent(current === slides.length - 1 ? 0 : current + 1);
  };

  // Mobile Swipe Handlers
  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) nextSlide();
    if (distance < -50) prevSlide();
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div
      className="relative w-full h-[360px] sm:h-[460px] md:h-[320px] rounded-3xl overflow-hidden shadow-2xl group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === current ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 pointer-events-none scale-105"
          }`}
          style={{ transitionProperty: "opacity, transform" }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
            loading={index === 0 ? "eager" : "lazy"}
          />

          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r ${slide.bgGradient}`} />

          {/* Slide Text Content */}
          <div className="absolute inset-0 flex flex-col justify-end sm:justify-center p-6 sm:p-12 md:p-16 max-w-2xl text-white">
            <span className="inline-flex items-center space-x-1.5 w-fit px-3 py-1 bg-white/20 backdrop-blur-md text-amber-300 font-bold text-xs uppercase tracking-wider rounded-full mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{slide.badge}</span>
            </span>

            <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-blue-200">
              {slide.subtitle}
            </p>

            <h2 className="text-xl sm:text-3xl md:text-5xl font-black mt-1.5 mb-2 sm:mb-4 leading-tight drop-shadow-md">
              {slide.title}
            </h2>

            <p className="hidden sm:block text-slate-200 text-sm md:text-base mb-6 line-clamp-2">
              {slide.desc}
            </p>

            <div>
              <Link
                to="/products"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl text-sm shadow-lg shadow-blue-600/40 transition duration-200"
              >
                <span>{slide.linkText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="hidden group-hover:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/30 backdrop-blur-md hover:bg-white/80 text-white hover:text-slate-900 rounded-full items-center justify-center transition shadow-lg"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="hidden group-hover:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/30 backdrop-blur-md hover:bg-white/80 text-white hover:text-slate-900 rounded-full items-center justify-center transition shadow-lg"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Interactive Dots / Thumb Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className={`transition-all duration-300 rounded-full ${
              current === i ? "w-7 h-2 bg-white" : "w-2 h-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}