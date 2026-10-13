import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getImageUrl, calculateFinalPrice } from "../utils/productUtils";

export default function HeroCarousel({ products = [] }) {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Gradient presets for aesthetic hero backgrounds
  const gradients = [
    "from-slate-950/85 via-slate-900/65 to-transparent",
    "from-blue-950/85 via-indigo-950/65 to-transparent",
    "from-purple-950/85 via-pink-950/65 to-transparent",
    "from-emerald-950/85 via-teal-950/65 to-transparent",
    "from-amber-950/85 via-orange-950/65 to-transparent"
  ];

  // Dynamic slides from backend products with random selection
  const slides = useMemo(() => {
    if (!products || products.length === 0) {
      return [
        {
          id: 1,
          title: "Next-Gen Collection 2026",
          subtitle: "FLAT 40% OFF FESTIVE DEAL",
          desc: "Discover premium quality electronics, fashion, and home utilities.",
          badge: "Featured Store",
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&q=80",
          link: "/products",
          bgGradient: gradients[0]
        }
      ];
    }

    // Shuffle and pick top 5 items
    const shuffled = [...products].sort(() => 0.5 - Math.random()).slice(0, 5);

    return shuffled.map((prod, idx) => {
      const finalPrice = calculateFinalPrice(prod.price, prod.discount);
      const firstImage =
        Array.isArray(prod.images) && prod.images.length > 0
          ? prod.images[0]
          : prod.image;

      return {
        id: prod._id || prod.id,
        title: prod.name,
        subtitle:
          prod.discount > 0
            ? `FLAT ${prod.discount}% OFF - NOW AT ₹${finalPrice.toLocaleString()}`
            : `STARTING FROM ₹${finalPrice.toLocaleString()}`,
        desc: prod.description,
        badge: prod.isTrending ? "Trending Now" : `${prod.category} Pick`,
        image: getImageUrl(firstImage),
        link: `/product/${prod._id || prod.id}`,
        bgGradient: gradients[idx % gradients.length]
      };
    });
  }, [products]);

  // Auto slide interval (3.5 seconds)
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 3500);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

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
      className="relative w-full h-[360px] sm:h-[460px] md:h-[340px] rounded-3xl overflow-hidden shadow-2xl group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id || index}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === current
              ? "opacity-100 z-10 scale-100"
              : "opacity-0 z-0 pointer-events-none scale-105"
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
          <div
            className={`absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r ${slide.bgGradient}`}
          />

          {/* Slide Text Content */}
          <div className="absolute inset-0 flex flex-col justify-end sm:justify-center p-6 sm:p-12 md:p-16 max-w-2xl text-white">
            <span className="inline-flex items-center space-x-1.5 w-fit px-3 py-1 bg-white/20 backdrop-blur-md text-amber-300 font-bold text-xs uppercase tracking-wider rounded-full mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{slide.badge}</span>
            </span>

            <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-pink-200">
              {slide.subtitle}
            </p>

            <h2 className="text-xl sm:text-3xl md:text-4xl font-black mt-1.5 mb-2 sm:mb-3 leading-tight drop-shadow-md line-clamp-2">
              {slide.title}
            </h2>

            <p className="hidden sm:block text-slate-200 text-xs md:text-sm mb-5 line-clamp-2">
              {slide.desc}
            </p>

            <div>
              <Link
                to={slide.link}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-pink-500 hover:opacity-95 active:scale-95 text-white font-bold px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl text-xs sm:text-sm shadow-lg shadow-pink-500/30 transition duration-200"
              >
                <span>View Product Details</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="hidden group-hover:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/30 backdrop-blur-md hover:bg-white/80 text-white hover:text-slate-900 rounded-full items-center justify-center transition shadow-lg cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="hidden group-hover:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/30 backdrop-blur-md hover:bg-white/80 text-white hover:text-slate-900 rounded-full items-center justify-center transition shadow-lg cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                current === i
                  ? "w-7 h-2 bg-white"
                  : "w-2 h-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}