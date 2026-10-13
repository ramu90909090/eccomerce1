import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Flame,
  Clock,
  Sparkles,
  Zap,
  SlidersHorizontal,
  XCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Tag,
  Laptop,
  Shirt,
  Footprints,
  Home as HomeIcon,
  Layers
} from "lucide-react";
import { products, calculateFinalPrice } from "../data/products";
import ProductCard from "../components/ProductCard";
import HeroCarousel from "../components/HeroCarousel";

// Section Carousel for Card-Enclosed Deals
function SectionCardCarousel({ title, subtitle, badgeText, badgeColor, items = [], viewAllLink = "/products" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerView(1.3);
      else if (window.innerWidth < 1024) setItemsPerView(2.5);
      else setItemsPerView(4);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, items.length - Math.floor(itemsPerView));

  useEffect(() => {
    if (isPaused || maxIndex === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3800);
    return () => clearInterval(timer);
  }, [isPaused, maxIndex]);

  const handlePrev = () => setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  const handleNext = () => setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));

  const handleTouchStart = (e) => (touchStartX.current = e.targetTouches[0].clientX);
  const handleTouchMove = (e) => (touchEndX.current = e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) handleNext();
    if (diff < -50) handlePrev();
  };

  if (!items.length) return null;

  return (
    <div
      className="bg-white/95 backdrop-blur-md p-5 sm:p-7 rounded-3xl border border-gray-100 shadow-xl shadow-pink-500/5 space-y-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <span className={`inline-flex items-center space-x-1 px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-white shadow-sm ${badgeColor}`}>
            <Sparkles className="w-3 h-3" />
            <span>{badgeText}</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1.5 tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <Link
            to={viewAllLink}
            className="text-xs font-bold text-pink-600 hover:text-violet-600 flex items-center space-x-1 mr-3"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handlePrev}
            className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-700 hover:text-pink-600 hover:border-pink-600 flex items-center justify-center shadow-sm active:scale-95 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-700 hover:text-pink-600 hover:border-pink-600 flex items-center justify-center shadow-sm active:scale-95 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden py-1">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
        >
          {items.map((prod) => (
            <div
              key={prod.id}
              className="shrink-0 px-2 box-border"
              style={{ width: `${100 / itemsPerView}%` }}
            >
              <ProductCard product={prod} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const categories = [
    { name: "All", icon: Layers, gradient: "from-violet-600 to-indigo-600" },
    { name: "Electronics", icon: Laptop, gradient: "from-blue-600 to-cyan-500" },
    { name: "Fashion", icon: Shirt, gradient: "from-pink-500 to-rose-500" },
    { name: "Footwear", icon: Footprints, gradient: "from-amber-500 to-orange-500" },
    { name: "Home", icon: HomeIcon, gradient: "from-emerald-500 to-teal-500" }
  ];

  const trendingProducts = useMemo(() => products.filter((p) => p.isTrending || p.rating >= 4.5), []);
  const offerProducts = useMemo(() => products.filter((p) => p.discount >= 25), []);
  const bestBuyProducts = useMemo(() => {
    return products.filter((p) => {
      const final = calculateFinalPrice(p.price, p.discount);
      return final <= 2500 && p.rating >= 4.2;
    });
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products.filter((prod) => {
      const finalPrice = calculateFinalPrice(prod.price, prod.discount);
      const matchesSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || prod.category === selectedCategory;
      const matchesPrice = finalPrice <= maxPrice;
      const matchesTab =
        activeTab === "all" ? true : activeTab === "trending" ? prod.isTrending : prod.isRecent;

      return matchesSearch && matchesCategory && matchesPrice && matchesTab;
    });

    if (sortBy === "low-to-high") {
      result.sort((a, b) => calculateFinalPrice(a.price, a.discount) - calculateFinalPrice(b.price, b.discount));
    } else if (sortBy === "high-to-low") {
      result.sort((a, b) => calculateFinalPrice(b.price, b.discount) - calculateFinalPrice(a.price, a.discount));
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [searchTerm, selectedCategory, maxPrice, activeTab, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8">
      
      {/* ======================================================== */}
      {/* 1. TOP HEADER: SMART SEARCHBAR & INTERACTIVE CATEGORIES */}
      {/* ======================================================== */}
      <div className="bg-white/95 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-white/80 shadow-xl shadow-pink-500/5 space-y-5">
        
        {/* Glowing Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search electronics, smartwatches, sneakers, leather bags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-11 py-3 bg-gray-50/90 border border-gray-200 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 rounded-2xl text-xs sm:text-sm font-semibold outline-none transition duration-200 shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Story-Style Visual Category Buttons */}
        <div className="flex items-center space-x-3 sm:space-x-6 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className="flex flex-col items-center space-y-1.5 shrink-0 group focus:outline-none"
              >
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center p-[2px] transition-all duration-300 ${
                    isSelected
                      ? "bg-gradient-to-tr from-violet-600 via-pink-500 to-amber-400 scale-105 shadow-lg shadow-pink-500/25 ring-2 ring-pink-500/30"
                      : "bg-gray-100 group-hover:bg-gray-200 group-hover:scale-105"
                  }`}
                >
                  <div
                    className={`w-full h-full rounded-[14px] flex items-center justify-center transition ${
                      isSelected
                        ? "bg-gradient-to-tr " + cat.gradient + " text-white"
                        : "bg-white text-gray-600 group-hover:text-pink-600"
                    }`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-bold transition ${
                    isSelected ? "text-pink-600" : "text-gray-600 group-hover:text-gray-900"
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Filter Row: Price Slider & Sorting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-pink-600" />
            <span className="font-bold text-gray-700">Filter By Price:</span>
            <span className="font-black text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md">
              Up to ₹{maxPrice.toLocaleString()}
            </span>
            <input
              type="range"
              min="500"
              max="5000"
              step="250"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="accent-pink-600 w-28 sm:w-40 cursor-pointer ml-2"
            />
          </div>

          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 border border-gray-200 py-1.5 px-3 rounded-xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-pink-500/20"
            >
              <option value="featured">Sort: Featured</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. HERO SLIDER BANNER                                    */}
      {/* ======================================================== */}
      <HeroCarousel />

      {/* ======================================================== */}
      {/* 3. ASSURANCE & BENEFITS BAR                              */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-3 p-2">
          <Truck className="w-5 h-5 text-violet-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-gray-900">Express Delivery</h4>
            <p className="text-[10px] text-gray-500">Free on orders &gt; ₹499</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-gray-900">100% Genuine</h4>
            <p className="text-[10px] text-gray-500">Direct Brand Warranty</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-2">
          <RotateCcw className="w-5 h-5 text-pink-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-gray-900">7-Day Free Return</h4>
            <p className="text-[10px] text-gray-500">Instant UPI refund</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-2">
          <Headphones className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-gray-900">Priority Support</h4>
            <p className="text-[10px] text-gray-500">24/7 dedicated desk</p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. PRODUCT CAROUSEL 1: MOST TRENDING PRODUCTS CARD       */}
      {/* ======================================================== */}
      <SectionCardCarousel
        title="Most Trending & Popular"
        subtitle="Customer ke dwara iss hafte sabse zyada order kiye gaye products"
        badgeText="Trending Now"
        badgeColor="bg-gradient-to-r from-orange-500 to-amber-500"
        items={trendingProducts}
      />

      {/* ======================================================== */}
      {/* 5. PRODUCT CAROUSEL 2: SUPER OFFERS & DEALS CARD         */}
      {/* ======================================================== */}
      <SectionCardCarousel
        title="Mega Discounts & Flash Deals"
        subtitle="Exclusive festive savings - Flat 25% se 50% off"
        badgeText="Mega Offers"
        badgeColor="bg-gradient-to-r from-pink-500 to-rose-600"
        items={offerProducts}
      />

      {/* ======================================================== */}
      {/* 6. PRODUCT CAROUSEL 3: BEST BUY / VALUE PICKS CARD       */}
      {/* ======================================================== */}
      <SectionCardCarousel
        title="Best Buy Under Budget"
        subtitle="Pocket-friendly prices par high rated genuine picks"
        badgeText="Best Value"
        badgeColor="bg-gradient-to-r from-violet-600 to-indigo-600"
        items={bestBuyProducts}
      />

      {/* ======================================================== */}
      {/* 7. ALL PRODUCTS EXPLORER CARD (TABS & LIVE GRID)         */}
      {/* ======================================================== */}
      <div className="bg-white/95 backdrop-blur-xl p-5 sm:p-8 rounded-3xl border border-gray-100 shadow-xl shadow-pink-500/5 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
              Full Catalogue
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-gray-900 mt-2">
              Browse All Products ({filteredProducts.length})
            </h2>
            <p className="text-xs text-gray-500">Live filters ke anuroop updated product list.</p>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex items-center space-x-2 bg-gray-100 p-1.5 rounded-2xl self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === "all"
                  ? "bg-white text-pink-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setActiveTab("trending")}
              className={`flex items-center space-x-1 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === "trending"
                  ? "bg-white text-orange-500 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Trending</span>
            </button>
            <button
              onClick={() => setActiveTab("recent")}
              className={`flex items-center space-x-1 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === "recent"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Filtered Grid Output */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Zap className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">Koi product match nahi hua</h3>
            <p className="text-xs text-gray-500">Filter criteria reset karke dekhein.</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
                setMaxPrice(5000);
                setActiveTab("all");
              }}
              className="text-xs font-bold px-4 py-2 bg-gradient-to-r from-violet-600 to-pink-500 text-white rounded-xl shadow-md shadow-pink-500/20 active:scale-95"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}