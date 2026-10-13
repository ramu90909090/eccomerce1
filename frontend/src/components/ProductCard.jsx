import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, ShoppingBag, Eye, Zap, Layers } from "lucide-react";
import { useCart } from "../context/CartContext";
import { calculateFinalPrice, getImageUrl } from "../utils/productUtils";

export default function ProductCard({ product }) {
  const { addToCart, setCheckoutItem } = useCart();
  const navigate = useNavigate();

  if (!product) return null;

  const productId = product._id || product.id;
  const finalPrice = calculateFinalPrice(product.price, product.discount);
  const fallbackImg = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80";

  // First image for thumbnail display
  const primaryImage =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : product.image || fallbackImg;

  const imageCount = Array.isArray(product.images) ? product.images.length : 1;

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCheckoutItem({
      ...product,
      id: productId,
      _id: productId,
      image: primaryImage,
      quantity: 1,
      finalPrice
    });
    navigate("/payment");
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      ...product,
      id: productId,
      _id: productId,
      image: primaryImage,
      finalPrice
    });
  };

  return (
    <div className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden h-full">
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {product.discount > 0 && (
          <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider">
            {product.discount}% OFF
          </span>
        )}
        {product.isTrending && (
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-sm uppercase tracking-wider">
            Trending
          </span>
        )}
      </div>

      {/* Image Count indicator */}
      {imageCount > 1 && (
        <div className="absolute top-3 right-3 z-10 flex items-center space-x-1 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
          <Layers className="w-3 h-3" />
          <span>{imageCount} photos</span>
        </div>
      )}

      {/* Image Container */}
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        <Link to={`/product/${productId}`}>
          <img
            src={getImageUrl(primaryImage)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackImg;
            }}
          />
        </Link>
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 pointer-events-none">
          <Link
            to={`/product/${productId}`}
            className="pointer-events-auto p-2.5 bg-white/95 rounded-2xl text-gray-700 hover:text-pink-600 shadow-md transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1.5 font-bold">
            <span className="text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
              {product.category}
            </span>
            <div className="flex items-center space-x-1 text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md">
              <Star className="w-3 h-3 fill-current" />
              <span>{product.rating ? Number(product.rating).toFixed(1) : "4.0"}</span>
            </div>
          </div>

          <Link to={`/product/${productId}`}>
            <h3 className="text-sm font-extrabold text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-baseline space-x-2 mb-3">
            <span className="text-base font-black text-gray-900">
              ₹{finalPrice.toLocaleString()}
            </span>
            {product.discount > 0 && (
              <span className="text-xs text-gray-400 line-through">
                ₹{Number(product.price).toLocaleString()}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAddToCart}
              className="w-full py-2 px-2 bg-gray-100 hover:bg-pink-50 text-gray-700 hover:text-pink-600 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 active:scale-95 transition"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Cart</span>
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full py-2 px-2 bg-gradient-to-r from-violet-600 to-pink-500 hover:opacity-95 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-md shadow-pink-500/15 active:scale-95 transition"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Buy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}