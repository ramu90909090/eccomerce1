import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { products, calculateFinalPrice } from "../data/products";
import { useCart } from "../context/CartContext";
import { Star, ShieldCheck, Truck, RefreshCw, ShoppingCart, Zap } from "lucide-react";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, setCheckoutItem } = useCart();

  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    return <div className="text-center py-20 text-gray-500">Product not found.</div>;
  }

  const finalPrice = calculateFinalPrice(product.price, product.discount);

  const handleBuyNow = () => {
    setCheckoutItem({ ...product, quantity: 1, finalPrice });
    navigate("/payment");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
          <img src={product.image} alt={product.name} className="w-full h-80 sm:h-96 object-cover" />
        </div>

        <div className="space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-md">
            {product.category}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>

          <div className="flex items-center space-x-2 text-amber-500 text-sm font-semibold">
            <Star className="w-4 h-4 fill-current" />
            <span>{product.rating} / 5.0 Rating</span>
          </div>

          <div className="border-t border-b border-gray-100 py-3 flex items-baseline space-x-4">
            <span className="text-3xl font-extrabold text-gray-900">₹{finalPrice.toLocaleString()}</span>
            <span className="text-lg text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
            <span className="text-sm font-bold text-red-500">Save {product.discount}%</span>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

          <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 text-xs text-gray-600">
            <div className="flex flex-col items-center text-center p-2">
              <Truck className="w-5 h-5 text-blue-600 mb-1" />
              <span>Free Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center p-2">
              <RefreshCw className="w-5 h-5 text-blue-600 mb-1" />
              <span>7 Days Return</span>
            </div>
            <div className="flex flex-col items-center text-center p-2">
              <ShieldCheck className="w-5 h-5 text-blue-600 mb-1" />
              <span>1 Year Warranty</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              onClick={() => addToCart(product)}
              className="w-full py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-xl flex items-center justify-center space-x-2 hover:bg-blue-50 transition"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center space-x-2 hover:bg-blue-700 transition"
            >
              <Zap className="w-5 h-5" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}