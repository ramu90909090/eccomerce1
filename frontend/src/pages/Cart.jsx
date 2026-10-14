import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { calculateFinalPrice, getImageUrl } from "../utils/productUtils";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowLeft
} from "lucide-react";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, setCheckoutItem } = useCart();
  const navigate = useNavigate();

  // 1. Calculations: Original MRP & Discounted Base Price
  const totalOriginalMRP = useMemo(() => {
    return cart.reduce((acc, item) => {
      const price = Number(item.price) || 0;
      const qty = item.quantity || 1;
      return acc + price * qty;
    }, 0);
  }, [cart]);

  const totalDiscountedBase = useMemo(() => {
    return cart.reduce((acc, item) => {
      const finalUnit =
        item.finalPrice || calculateFinalPrice(item.price, item.discount);
      const qty = item.quantity || 1;
      return acc + finalUnit * qty;
    }, 0);
  }, [cart]);

  const totalSavings = totalOriginalMRP - totalDiscountedBase;

  // Delivery charge rule: < 1000 => ₹50, else FREE
  const deliveryFee =
    totalDiscountedBase < 1000 && totalDiscountedBase > 0 ? 50 : 0;

  // 18% GST preview
  const gstAmount = Math.round(totalDiscountedBase * 0.18);

  // Final Payable preview
  const finalPayable = totalDiscountedBase + gstAmount + deliveryFee;

  // 2. Checkout Redirect
  const handleProceedToBuy = () => {
    setCheckoutItem(null); // Clear single item checkout to process full cart
    navigate("/payment");
  };

  // 3. Empty Cart Screen
  if (!cart || cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-5">
        <div className="w-20 h-20 bg-pink-50 rounded-3xl flex items-center justify-center text-pink-600 mx-auto shadow-md">
          <ShoppingBag className="w-10 h-10 animate-bounce" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Aapka Shopping Cart Khali Hai
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
          Apne pasandeeda products ko browse karein aur exclusive discounts ke
          sath cart me add karein.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-extrabold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-pink-500/20 active:scale-95 transition"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
            Review Bag
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
            Shopping Cart ({cart.length} Items)
          </h1>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-pink-600 hover:text-violet-600 transition self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* Main Grid: Cart Items on Left (7 cols), Order Summary on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Dynamic Items List */}
        <div className="lg:col-span-7 space-y-4">
          {cart.map((item) => {
            const itemId = item._id || item.id;
            const finalUnitPrice =
              item.finalPrice ||
              calculateFinalPrice(item.price, item.discount);

            // Dynamic Image resolver (First image from array or string)
            const itemImage =
              Array.isArray(item.images) && item.images.length > 0
                ? item.images[0]
                : item.image;

            const itemStock =
              item.stock !== undefined ? Number(item.stock) : 99;

            return (
              <div
                key={itemId}
                className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition duration-200"
              >
                {/* Product Thumbnail */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                  <img
                    src={getImageUrl(itemImage)}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80";
                    }}
                  />
                </div>

                {/* Details & Actions */}
                <div className="flex-1 flex flex-col justify-between space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {item.category && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md">
                          {item.category}
                        </span>
                      )}
                      <Link to={`/product/${itemId}`}>
                        <h3 className="font-extrabold text-sm sm:text-base text-gray-900 hover:text-pink-600 transition line-clamp-1 mt-1">
                          {item.name}
                        </h3>
                      </Link>
                    </div>

                    <button
                      onClick={() => removeFromCart(itemId)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Price Row */}
                  <div className="flex items-baseline space-x-2">
                    <span className="text-base font-black text-gray-900">
                      ₹{finalUnitPrice.toLocaleString()}
                    </span>
                    {item.discount > 0 && (
                      <>
                        <span className="text-xs text-gray-400 line-through">
                          ₹{Number(item.price).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {item.discount}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  {/* Quantity Controls & Item Total */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                      <button
                        onClick={() => updateQuantity(itemId, -1)}
                        className="px-2.5 py-1 hover:bg-gray-200 text-gray-700 font-bold transition cursor-pointer"
                        title="Decrease"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-1 text-xs font-black bg-white text-gray-900 border-x border-gray-100">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          if (item.quantity >= itemStock) {
                            alert(
                              `Sirf ${itemStock} items hi stock me uplabdh hain.`
                            );
                            return;
                          }
                          updateQuantity(itemId, 1);
                        }}
                        className="px-2.5 py-1 hover:bg-gray-200 text-gray-700 font-bold transition cursor-pointer"
                        title="Increase"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-gray-400 font-semibold block">
                        Item Subtotal
                      </span>
                      <span className="text-sm font-black text-gray-900">
                        ₹{(finalUnitPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Order Summary Card */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-pink-500/5 space-y-5">
            <h2 className="text-lg font-black text-gray-900">Order Summary</h2>

            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Total Items MRP</span>
                <span className="font-bold text-gray-900">
                  ₹{totalOriginalMRP.toLocaleString()}
                </span>
              </div>

              {totalSavings > 0 && (
                <div className="flex justify-between text-pink-600 font-bold">
                  <span>Product Instant Discount</span>
                  <span>-₹{totalSavings.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated GST (18%)</span>
                <span className="font-bold text-gray-900">
                  +₹{gstAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Delivery Charges</span>
                {deliveryFee > 0 ? (
                  <span className="font-bold text-amber-600">
                    +₹50 (Orders &lt; ₹1,000)
                  </span>
                ) : (
                  <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md">
                    FREE EXPRESS
                  </span>
                )}
              </div>

              <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-baseline font-black text-gray-900 text-sm">
                <span>Final Payable Amount</span>
                <span className="text-2xl font-black bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
                  ₹{finalPayable.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={handleProceedToBuy}
              className="w-full py-4 bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 hover:opacity-95 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-pink-500/25 active:scale-98 transition cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Assurance Badges */}
            <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-center text-[10px] font-bold text-gray-500">
              <div className="flex items-center justify-center space-x-1 p-2 bg-gray-50 rounded-xl">
                <Truck className="w-3.5 h-3.5 text-violet-600" />
                <span>Pan-India Dispatch</span>
              </div>
              <div className="flex items-center justify-center space-x-1 p-2 bg-gray-50 rounded-xl">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Genuine</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}