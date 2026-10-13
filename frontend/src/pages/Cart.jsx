import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { calculateFinalPrice } from "../data/products";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, setCheckoutItem } = useCart();
  const navigate = useNavigate();

  const totalOriginal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalAmount = cart.reduce((acc, item) => {
    return acc + calculateFinalPrice(item.price, item.discount) * item.quantity;
  }, 0);
  const totalSavings = totalOriginal - totalAmount;

  const handleProceedToBuy = () => {
    setCheckoutItem(null); // Indicates cart checkout
    navigate("/payment");
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Aapka Cart Khali Hai</h2>
        <p className="text-gray-500 text-sm">Koi bhi product browse karke cart me add karein.</p>
        <Link to="/" className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart ({cart.length})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const final = calculateFinalPrice(item.price, item.discount);
            return (
              <div key={item.id} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <img src={item.image} alt={item.name} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl" />
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{item.name}</h3>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900">₹{final.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 line-through">₹{item.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-semibold px-2">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Total MRP</span>
              <span>₹{totalOriginal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-₹{totalSavings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="text-green-600 font-semibold">FREE</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-base">
              <span>Final Payable</span>
              <span>₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={handleProceedToBuy}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-blue-700 transition"
          >
            <span>Proceed to Buy</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}