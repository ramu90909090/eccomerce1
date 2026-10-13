import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import ProductCard from "./ProductCard";

export default function ProductCarousel({ title, subtitle, items = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Screen size ke hisab se visible cards count calculate karna
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1.5); // Mobile me partial view dikhega
      } else if (window.innerWidth < 1024) {
        setItemsPerView(3);
      } else {
        setItemsPerView(4);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const maxIndex = Math.max(0, items.length - Math.floor(itemsPerView));

  // Auto-play timer
  useEffect(() => {
    if (isPaused || maxIndex === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, maxIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) handleNext();
    if (diff < -50) handlePrev();
  };

  if (!items.length) return null;

  return (
    <div
      className="bg-gradient-to-br from-indigo-900/5 via-pink-500/5 to-violet-900/5 p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Carousel Header & Controls */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-pink-600 uppercase tracking-wider bg-pink-50 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{subtitle || "Recommended For You"}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
            {title || "Featured Highlights"}
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrev}
            aria-label="Previous"
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-pink-600 hover:border-pink-600 flex items-center justify-center shadow-sm active:scale-95 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next"
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-pink-600 hover:border-pink-600 flex items-center justify-center shadow-sm active:scale-95 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel Track */}
      <div className="overflow-hidden py-2">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
          }}
        >
          {items.map((prod) => (
            <div
              key={prod.id}
              className="shrink-0 px-2 box-border"
              style={{ width: `${100 / itemsPerView}%` }}
            >
              <div className="h-full">
                <ProductCard product={prod} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}