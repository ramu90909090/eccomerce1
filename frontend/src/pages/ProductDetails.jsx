import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useCart } from "../context/CartContext";
import { calculateFinalPrice, getImageUrl } from "../utils/productUtils";
import {
  Star,
  ShieldCheck,
  Truck,
  RefreshCw,
  ShoppingCart,
  Zap,
  ArrowLeft,
  Loader2,
  Check,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  CheckCircle2,
  HelpCircle,
  FileText
} from "lucide-react";
import ProductCarousel from "../components/ProductCarousel";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, setCheckoutItem } = useCart();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddedToast, setIsAddedToast] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  const fallbackImg =
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const [productRes, allRes] = await Promise.all([
          API.get(`/products/${id}`),
          API.get("/products")
        ]);
        setProduct(productRes.data?.data);
        setAllProducts(allRes.data?.data || []);
        setActiveImageIndex(0);
      } catch (err) {
        console.error("Fetch product error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetails();
  }, [id]);

  const imagesList = useMemo(() => {
    if (!product) return [fallbackImg];
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    return product.image ? [product.image] : [fallbackImg];
  }, [product]);

  const relatedRandomProducts = useMemo(() => {
    if (!allProducts.length || !product) return [];
    const currentId = product._id || product.id;
    return allProducts
      .filter((p) => (p._id || p.id) !== currentId)
      .sort(() => 0.5 - Math.random())
      .slice(0, 8);
  }, [allProducts, product]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-pink-600 animate-spin" />
        <p className="text-xs font-bold text-gray-500">
          Product details load ho rahi hain...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <h2 className="text-2xl font-black text-gray-900">Product Not Found</h2>
        <p className="text-xs text-gray-500">
          Yeh item catalogue me uplabdh nahi hai ya delete ho gaya hai.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center space-x-1 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold text-xs rounded-2xl shadow-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products</span>
        </Link>
      </div>
    );
  }

  const productId = product._id || product.id;
  const finalPrice = calculateFinalPrice(product.price, product.discount);
  const totalSavings = (Number(product.price) - finalPrice) * quantity;

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % imagesList.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex(
      (prev) => (prev - 1 + imagesList.length) % imagesList.length
    );
  };

  const handleAddToCart = () => {
    addToCart({
      ...product,
      id: productId,
      _id: productId,
      image: imagesList[0],
      quantity,
      finalPrice
    });
    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 2200);
  };

  const handleBuyNow = () => {
    setCheckoutItem({
      ...product,
      id: productId,
      _id: productId,
      image: imagesList[0],
      quantity,
      finalPrice
    });
    navigate("/payment");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 pb-24 md:pb-10">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-gray-500">
        <Link to="/" className="hover:text-pink-600 transition">
          Home
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-pink-600 transition">
          Products
        </Link>
        <span>/</span>
        <span className="text-violet-600 font-bold">{product.category}</span>
        <span>/</span>
        <span className="text-gray-900 truncate max-w-[200px] sm:max-w-xs font-bold">
          {product.name}
        </span>
      </nav>

      {/* 2. Top Interactive Hero Grid: Images on Left, Instant Action Box on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Multi-Image Showcase (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4 items-center sm:items-start lg:sticky lg:top-24">
          {/* Thumbnails Row/Column */}
          <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[520px] w-full sm:w-24 shrink-0 pb-2 sm:pb-0 scrollbar-none">
            {imagesList.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-gray-50 ${
                  activeImageIndex === index
                    ? "border-pink-600 ring-4 ring-pink-500/20 scale-102 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={getImageUrl(img)}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = fallbackImg;
                  }}
                />
              </button>
            ))}
          </div>

          {/* Main Visual Image Stage */}
          <div className="relative flex-1 w-full bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm aspect-square group">
            <img
              src={getImageUrl(imagesList[activeImageIndex])}
              alt={`${product.name} Preview ${activeImageIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = fallbackImg;
              }}
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              {product.discount > 0 && (
                <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-xs px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                  {product.discount}% OFF
                </span>
              )}
              {product.isTrending && (
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-wider">
                  Trending Pick
                </span>
              )}
            </div>

            <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white font-bold text-[11px] px-3 py-1 rounded-full shadow">
              {activeImageIndex + 1} / {imagesList.length} Photos
            </span>

            {/* Prev/Next Buttons */}
            {imagesList.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-gray-800 shadow-md flex items-center justify-center hover:bg-white active:scale-95 transition backdrop-blur-sm"
                  title="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-gray-800 shadow-md flex items-center justify-center hover:bg-white active:scale-95 transition backdrop-blur-sm"
                  title="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Column: TOP PRIORITY ACTION BOX (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-sm space-y-6">
          {/* 1. Category & Heading */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
                {product.category}
              </span>
              <div className="flex items-center space-x-1.5 text-xs">
                <div className="flex items-center space-x-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md font-black">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>
                    {product.rating ? Number(product.rating).toFixed(1) : "4.0"}
                  </span>
                </div>
                <span className="text-gray-400 font-semibold">(Verified)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-snug">
              {product.name}
            </h1>
          </div>

          {/* 2. Primary Pricing Block */}
          <div className="bg-gradient-to-r from-pink-50/60 via-purple-50/40 to-transparent p-4 rounded-2xl border border-pink-100/70 space-y-1.5">
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl sm:text-4xl font-black text-gray-900">
                ₹{finalPrice.toLocaleString()}
              </span>
              {product.discount > 0 && (
                <span className="text-base text-gray-400 line-through font-semibold">
                  ₹{Number(product.price).toLocaleString()}
                </span>
              )}
            </div>

            {product.discount > 0 && (
              <div className="flex items-center space-x-1.5 text-emerald-600 font-extrabold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  Bachat: ₹{totalSavings.toLocaleString()} (
                  {product.discount}% Discount Applied)
                </span>
              </div>
            )}
            <p className="text-[11px] text-gray-400 font-medium">
              Inclusive of all taxes & free standard shipping
            </p>
          </div>

          {/* 3. Quantity Selector */}
          <div className="flex items-center justify-between py-2 border-y border-gray-100 text-xs">
            <span className="font-extrabold text-gray-700">Quantity Select:</span>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3.5 py-1.5 hover:bg-gray-200 font-bold text-gray-600 transition"
              >
                -
              </button>
              <span className="px-4 py-1.5 font-black bg-white text-gray-900 border-x border-gray-100">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3.5 py-1.5 hover:bg-gray-200 font-bold text-gray-600 transition"
              >
                +
              </button>
            </div>
          </div>

          {/* 4. Instant Action Buttons (Buy Now & Add to Cart) */}
          <div className="space-y-2.5 pt-1">
            <button
              onClick={handleBuyNow}
              className="w-full py-4 bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-black rounded-2xl flex items-center justify-center space-x-2 text-xs uppercase tracking-wider shadow-lg shadow-pink-500/25 active:scale-98 transition cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Instant Buy (₹{(finalPrice * quantity).toLocaleString()})</span>
            </button>

            <button
              onClick={handleAddToCart}
              className="w-full py-3.5 border-2 border-violet-600 text-violet-700 hover:bg-violet-50 font-bold rounded-2xl flex items-center justify-center space-x-2 text-xs uppercase tracking-wider active:scale-98 transition cursor-pointer"
            >
              {isAddedToast ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600 font-black">
                    Cart me add ho gaya!
                  </span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>

          {/* 5. Trust & Assurances Pill Badges */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center">
            <div className="p-2.5 bg-gray-50 rounded-xl space-y-1">
              <Truck className="w-4 h-4 text-violet-600 mx-auto" />
              <p className="text-[10px] font-bold text-gray-800">Free Delivery</p>
              <p className="text-[9px] text-gray-400">Within 2-4 days</p>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-xl space-y-1">
              <RefreshCw className="w-4 h-4 text-pink-600 mx-auto" />
              <p className="text-[10px] font-bold text-gray-800">7 Days Return</p>
              <p className="text-[9px] text-gray-400">Hassle-free UPI</p>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-xl space-y-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto" />
              <p className="text-[10px] font-bold text-gray-800">100% Genuine</p>
              <p className="text-[9px] text-gray-400">Brand Warranty</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Below The Fold: Extended Details & Specification Tabs */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
          <button
            onClick={() => setActiveTab("description")}
            className={`flex items-center space-x-2 pb-2 text-sm font-black transition relative ${
              activeTab === "description"
                ? "text-pink-600"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Product Description</span>
            {activeTab === "description" && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-pink-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("policy")}
            className={`flex items-center space-x-2 pb-2 text-sm font-black transition relative ${
              activeTab === "policy"
                ? "text-pink-600"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Shipping & Warranty Policy</span>
            {activeTab === "policy" && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-pink-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "description" ? (
          <div className="prose max-w-none text-gray-700 space-y-4">
            <h3 className="text-base font-black text-gray-900">
              Detailed Specifications & Information
            </h3>
            {/* Preserving clean formatting for multi-paragraph or long text */}
            <div className="bg-gray-50/70 p-5 sm:p-6 rounded-2xl border border-gray-100 text-sm leading-relaxed whitespace-pre-line text-gray-600">
              {product.description}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
              <h4 className="font-bold text-gray-900 flex items-center space-x-1.5">
                <Truck className="w-4 h-4 text-violet-600" />
                <span>Shipping Guidelines</span>
              </h4>
              <p>
                All orders are dispatched within 24 hours. Express courier partners
                ensure safe door-to-door delivery with real-time SMS tracking updates.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
              <h4 className="font-bold text-gray-900 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Replacement & Refund</span>
              </h4>
              <p>
                Product received damaged or defective? Return request can be placed
                within 7 days directly from your profile with instant refund to bank account.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4. Recommendations Carousel */}
      {relatedRandomProducts.length > 0 && (
        <div className="pt-2">
          

<ProductCarousel
            title="Customers Also Viewed"
            subtitle="Explore Similar Recommendations"
            items={relatedRandomProducts}
          />
        </div>
      )}

      {/* 5. Mobile Fixed Bottom Action Bar (Jab user scroll karke niche description padh raha ho) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <span className="block text-[10px] text-gray-400 font-bold uppercase">
            Payable Amount
          </span>
          <span className="text-lg font-black text-gray-900">
            ₹{(finalPrice * quantity).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center space-x-2 flex-1 max-w-[240px]">
          <button
            onClick={handleAddToCart}
            className="flex-1 py-2.5 border border-violet-600 text-violet-700 rounded-xl text-xs font-bold"
          >
            {isAddedToast ? "Added" : "Cart"}
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-xl text-xs font-black shadow-md shadow-pink-500/20"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}