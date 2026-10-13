import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingBag, ShieldCheck, Zap } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Normalize Images Array
  const images = product.images?.length
    ? product.images.map((img) => (typeof img === "string" ? img : img.url))
    : [product.image || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80"];

  const id = product._id || product.id;
  const sellingPrice = product.sellingPrice || product.price || 0;
  const actualPrice = product.actualPrice || (product.price ? product.price * 1.3 : 0);
  const discount = product.discount || (actualPrice > sellingPrice ? Math.round(((actualPrice - sellingPrice) / actualPrice) * 100) : 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between h-full group hover:shadow-xl transition-all duration-300">
      <div className="relative overflow-hidden bg-slate-50 h-52 sm:h-56">
        {/* Main Display Image */}
        <Link to={`/product/${id}`}>
          <img
            src={images[activeImageIndex] || images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-md uppercase">
            {discount}% OFF
          </span>
        )}

        {/* Trending Tag */}
        {product.isTrending && (
          <span className="absolute top-2.5 right-2.5 bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm flex items-center space-x-0.5">
            <Zap className="w-3 h-3 fill-current" />
            <span>Hot</span>
          </span>
        )}

        {/* Multi-Image Hover Dots preview */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {images.slice(0, 5).map((_, i) => (
              <button
                key={i}
                onMouseEnter={() => setActiveImageIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeImageIndex === i ? "bg-pink-600 w-4" : "bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Details Area */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
            <span className="font-bold uppercase tracking-wider text-violet-600">{product.category}</span>
            <span className="flex items-center space-x-1 text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{product.rating || 4.5}</span>
            </span>
          </div>

          <Link to={`/product/${id}`}>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 hover:text-pink-600 transition">
              {product.name}
            </h3>
          </Link>
        </div>

        <div>
          {/* Price & Stock */}
          <div className="flex items-baseline space-x-2">
            <span className="text-base sm:text-lg font-black text-gray-900">
              ₹{sellingPrice.toLocaleString()}
            </span>
            {actualPrice > sellingPrice && (
              <span className="text-xs text-gray-400 line-through">
                ₹{actualPrice.toLocaleString()}
              </span>
            )}
          </div>

          <p className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3" />
            <span>{product.warranty || "Genuine Guarantee"}</span>
          </p>

          <button
            onClick={() => addToCart({ ...product, price: sellingPrice, image: images[0] })}
            className="mt-3 w-full py-2.5 bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-700 hover:to-pink-600 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md shadow-pink-500/20 active:scale-95 transition flex items-center justify-center space-x-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}