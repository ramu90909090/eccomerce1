import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  Grid,
  List,
  Star,
  X,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Tag,
  ArrowUpDown,
  Loader2
} from "lucide-react";
import API from "../api/axios";
import { calculateFinalPrice } from "../utils/productUtils";
import ProductCard from "../components/ProductCard";
import ProductCarousel from "../components/ProductCarousel";

export default function Products() {
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const categories = ["All", "Electronics", "Fashion", "Footwear", "Home"];

  // Fetch Products Dynamically from MongoDB API
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        const res = await API.get("/products");
        const list = res.data?.data || [];
        setProductsList(list);

        // Dynamically adjust maximum slider range to highest priced item
        if (list.length > 0) {
          const highestPrice = Math.max(...list.map((p) => p.price));
          if (highestPrice > 5000) {
            setMaxPrice(highestPrice);
          }
        }
      } catch (err) {
        console.error("Products load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  // Dynamic Randomized Products for Carousel on Every Reload/Session
  const randomizedCarouselProducts = useMemo(() => {
    if (!productsList.length) return [];
    // Shuffle array randomly and pick top 8 items
    const shuffled = [...productsList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 8);
  }, [productsList]);

  // Client-Side Search, Filters & Sorting
  const filteredProducts = useMemo(() => {
    let list = productsList.filter((prod) => {
      const finalPrice = calculateFinalPrice(prod.price, prod.discount);
      const matchesSearch =
        prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || prod.category === selectedCategory;
      const matchesPrice = finalPrice <= maxPrice;
      const matchesRating = prod.rating >= minRating;

      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    });

    if (sortBy === "price-low") {
      list.sort(
        (a, b) => calculateFinalPrice(a.price, a.discount) - calculateFinalPrice(b.price, b.discount)
      );
    } else if (sortBy === "price-high") {
      list.sort(
        (a, b) => calculateFinalPrice(b.price, b.discount) - calculateFinalPrice(a.price, a.discount)
      );
    } else if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "discount") {
      list.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    }

    return list;
  }, [productsList, searchTerm, selectedCategory, maxPrice, minRating, sortBy]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setMaxPrice(5000);
    setMinRating(0);
    setSortBy("featured");
  };

  const activeFiltersCount = [
    selectedCategory !== "All",
    maxPrice < 5000,
    minRating > 0,
    searchTerm !== ""
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Dynamic Randomized Highlights Carousel */}
      {randomizedCarouselProducts.length > 0 && (
        

<ProductCarousel
          title="Curated Spotlight Deals"
          subtitle="Discover Hot Picks Today"
          items={randomizedCarouselProducts}
        />
      )}

      {/* 2. Search & Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-pink-500 rounded-2xl text-xs sm:text-sm font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-pink-500/10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Toolbar: Mobile Filters, Sort, View Layout */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-pink-500/20 active:scale-95 transition"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-white text-pink-600 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-extrabold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <div className="relative flex items-center">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-500 absolute left-3 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 pl-8 pr-8 py-2.5 rounded-2xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer hover:bg-gray-100/70 transition"
            >
              <option value="featured">Featured Sort</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="discount">Biggest Discount</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 pointer-events-none" />
          </div>

          <div className="hidden sm:flex items-center space-x-1 bg-gray-100 p-1 rounded-2xl">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-xl transition ${
                viewMode === "grid" ? "bg-white text-pink-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-xl transition ${
                viewMode === "list" ? "bg-white text-pink-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Body: Sticky Filter Sidebar & Products Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-24 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-pink-600" />
              <h2 className="font-bold text-gray-900 text-sm">Filter Catalogue</h2>
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="flex items-center space-x-1 text-xs text-pink-600 hover:text-pink-700 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5">
              Categories
            </label>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all duration-200 ${
                    selectedCategory === cat
                      ? "bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-md shadow-pink-500/20 translate-x-1"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span>{cat}</span>
                  <Tag className={`w-3.5 h-3.5 ${selectedCategory === cat ? "text-white" : "text-gray-400"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Range */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Max Budget
              </label>
              <span className="text-xs font-black text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md">
                ₹{maxPrice.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="200"
              max="20000"
              step="200"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-pink-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
              Minimum Rating
            </label>
            <div className="space-y-1.5">
              {[4, 3, 2, 0].map((star) => (
                <button
                  key={star}
                  onClick={() => setMinRating(star)}
                  className={`w-full flex items-center space-x-2 px-3.5 py-2 rounded-2xl text-xs font-medium border transition ${
                    minRating === star
                      ? "border-amber-400 bg-amber-50/50 text-amber-800 font-bold"
                      : "border-gray-100 hover:border-gray-200 text-gray-600"
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{star === 0 ? "All Ratings" : `${star} Stars & Above`}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Items Grid */}
        <section className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>
              Showing <strong className="text-gray-900">{filteredProducts.length}</strong> items from backend
            </span>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl p-20 text-center border border-gray-100 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-pink-600 animate-spin" />
              <p className="text-xs font-bold text-gray-500">Loading catalogue data from server...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-14 text-center border border-gray-100 shadow-sm space-y-3">
              <Sparkles className="w-10 h-10 text-pink-500 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-gray-900">Koi Product Match Nahi Hua</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Aapke filter criteria ke anusar koi item nahi mila. Filter reset karein ya search term change karein.
              </p>
              <button
                onClick={resetFilters}
                className="mt-2 inline-flex items-center space-x-1.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-md transition active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
                  : "flex flex-col space-y-4"
              }
            >
              {filteredProducts.map((product) => (
                <div key={product._id || product.id} className="h-full">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 4. Mobile Slide-over Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="w-4/5 max-w-sm bg-white h-full p-6 shadow-2xl overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4 text-pink-600" />
                  <h3 className="font-bold text-base text-gray-900">Filters</h3>
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-xl text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Category */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(c)}
                      className={`py-2 px-3 rounded-2xl text-xs font-bold text-center border transition ${
                        selectedCategory === c
                          ? "bg-pink-600 text-white border-pink-600 shadow-md"
                          : "border-gray-200 text-gray-700 bg-gray-50"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Price */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Max Price
                  </label>
                  <span className="text-xs font-black text-pink-600">
                    ₹{maxPrice.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="20000"
                  step="200"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-pink-600"
                />
              </div>

              {/* Mobile Rating */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                  Minimum Rating
                </label>
                <div className="space-y-1">
                  {[4, 3, 2, 0].map((star) => (
                    <button
                      key={star}
                      onClick={() => setMinRating(star)}
                      className={`w-full flex items-center space-x-2 p-2 rounded-xl text-xs border ${
                        minRating === star ? "bg-amber-50 border-amber-400 font-bold" : "border-gray-100"
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{star === 0 ? "All Ratings" : `${star} & Above`}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 space-y-2">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold rounded-2xl text-sm shadow-md"
              >
                Apply Filters ({filteredProducts.length})
              </button>
              <button
                onClick={() => {
                  resetFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="w-full py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-2xl text-xs"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}