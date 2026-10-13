import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { calculateFinalPrice } from "../data/products";
import {
  ShieldCheck,
  CreditCard,
  Banknote,
  CheckCircle2,
  Lock,
  QrCode,
  Tag,
  Truck,
  Sparkles,
  ArrowRight,
  Building,
  Smartphone,
  ChevronRight,
  AlertCircle
} from "lucide-react";

export default function Payment() {
  const { cart, checkoutItem, clearCart } = useCart();
  const navigate = useNavigate();

  // Delivery Form State
  const [formData, setFormData] = useState({
    name: "Rahul Sharma",
    phone: "9876543210",
    address: "Flat 402, Royal Palms, Hazratganj",
    city: "Lucknow",
    pincode: "226001",
    state: "Uttar Pradesh"
  });

  // Payment Selection State
  const [paymentMode, setPaymentMode] = useState("upi"); // 'upi' | 'card' | 'netbanking' | 'cod'
  const [upiId, setUpiId] = useState("");
  const [cardDetails, setCardDetails] = useState({
    number: "4532 •••• •••• 8821",
    name: "RAHUL SHARMA",
    expiry: "08/29",
    cvv: ""
  });

  // Coupon & Processing State
  const [coupon, setCoupon] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Single Item vs Full Cart items
  const items = checkoutItem ? [checkoutItem] : cart;

  const originalTotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const calculatedBase = items.reduce((acc, it) => {
    const finalUnit = it.finalPrice || calculateFinalPrice(it.price, it.discount);
    return acc + finalUnit * it.quantity;
  }, 0);

  const productSavings = originalTotal - calculatedBase;
  const finalPayable = Math.max(0, calculatedBase - couponDiscount);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (coupon.trim().toUpperCase() === "KHA10") {
      const discount = Math.round(calculatedBase * 0.1);
      setCouponDiscount(discount);
      setCouponError("");
    } else {
      setCouponError("Invalid code. 'KHA10' use karke 10% off payein.");
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProcessOrder = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      if (!checkoutItem) clearCart();

      setTimeout(() => {
        navigate("/");
      }, 4000);
    }, 2500);
  };

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-amber-500 mx-auto animate-bounce" />
        <h2 className="text-2xl font-black text-gray-900">Checkout Khali Hai</h2>
        <p className="text-xs text-gray-500">Cart me product add karein ya direct 'Buy Now' click karein.</p>
        <button
          onClick={() => navigate("/products")}
          className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold text-xs rounded-xl shadow-md"
        >
          Browse Products
        </button>
      </div>
    );
  }

  // 1. Success Screen Animation
  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-gradient-to-br from-violet-50 via-pink-50/50 to-amber-50/40">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-xl border border-white p-8 rounded-3xl shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-emerald-500/30 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
              Payment Confirmed
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
              Order Placed Successfully!
            </h2>
            <p className="text-xs text-gray-500">
              Payment token receive ho gaya hai. Order details aapke registered mobile par SMS dwara bhej di gayi hain.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-left space-y-1 text-xs">
            <div className="flex justify-between font-semibold text-gray-600">
              <span>Transaction ID:</span>
              <span className="text-gray-900 font-mono">TXN-{Math.floor(100000 + Math.random() * 900000)}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-600">
              <span>Amount Paid:</span>
              <span className="text-emerald-600 font-bold">₹{finalPayable.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-600">
              <span>Delivery To:</span>
              <span className="text-gray-900 truncate max-w-[180px]">{formData.name}, {formData.city}</span>
            </div>
          </div>

          <div className="pt-2 text-xs text-gray-400 flex items-center justify-center space-x-1">
            <Truck className="w-4 h-4 text-pink-600" />
            <span>Redirecting to Home in a few seconds...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-pink-500/10">
        <div className="relative z-10 max-w-xl space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5 text-amber-300" />
            <span>256-Bit Encrypted Secure Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Complete Your Payment</h1>
          <p className="text-pink-100 text-xs sm:text-sm">
            Instant UPI cashback offers, No-Cost EMI options aur verified payment gateway.
          </p>
        </div>
      </div>

      {/* Main Grid: Form & Mode on Left (7 cols), Order Summary on Right (5 cols) */}
      <form onSubmit={handleProcessOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Address & Payment Methods */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Delivery Address Card */}
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-black text-xs">
                  1
                </div>
                <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">Shipping & Delivery Details</h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Step 1 of 2
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-pink-500 rounded-xl px-3.5 py-2.5 outline-none font-semibold transition"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Mobile Number</label>
                <input
                  required
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-pink-500 rounded-xl px-3.5 py-2.5 outline-none font-semibold transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">Street Address / Landmark</label>
                <input
                  required
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-pink-500 rounded-xl px-3.5 py-2.5 outline-none font-semibold transition"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">City / District</label>
                <input
                  required
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleFormChange}
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-pink-500 rounded-xl px-3.5 py-2.5 outline-none font-semibold transition"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Area Pincode</label>
                <input
                  required
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleFormChange}
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-pink-500 rounded-xl px-3.5 py-2.5 outline-none font-semibold transition"
                />
              </div>
            </div>
          </div>

          {/* 2. Interactive Payment Method Selector */}
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-black text-xs">
                  2
                </div>
                <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">Payment Method Selection</h3>
              </div>
              <div className="flex items-center space-x-1 text-emerald-600 text-[11px] font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Gateway</span>
              </div>
            </div>

            {/* Mode Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: "upi", label: "Instant UPI", icon: Smartphone, color: "from-blue-600 to-cyan-500" },
                { id: "card", label: "Card / EMI", icon: CreditCard, color: "from-violet-600 to-indigo-600" },
                { id: "netbanking", label: "NetBanking", icon: Building, color: "from-pink-500 to-rose-600" },
                { id: "cod", label: "Cash on Delivery", icon: Banknote, color: "from-amber-500 to-orange-500" }
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = paymentMode === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPaymentMode(tab.id)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 ${
                      isSelected
                        ? "border-pink-500 bg-pink-50/50 shadow-md shadow-pink-500/10 scale-102"
                        : "border-gray-200 hover:border-gray-300 bg-gray-50/60"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-white bg-gradient-to-tr ${tab.color} shadow-sm`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[11px] font-bold ${isSelected ? "text-pink-600" : "text-gray-700"}`}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Payment Body */}
            <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
              
              {/* UPI Tab View */}
              {paymentMode === "upi" && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Animated QR Code Mockup */}
                    <div className="relative bg-white p-3 rounded-2xl border border-gray-200 shadow-sm shrink-0 flex flex-col items-center">
                      <div className="w-28 h-28 bg-gray-900 rounded-xl p-2 relative overflow-hidden flex items-center justify-center text-white">
                        <QrCode className="w-20 h-20" />
                        {/* Laser Scan Animation Line */}
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 mt-1">Scan via PhonePe/GPay</span>
                    </div>

                    <div className="space-y-2 flex-1 w-full text-xs">
                      <label className="block font-bold text-gray-700">Or Pay via UPI ID / VPA</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="mobilenumber@upi or username@okhdfcbank"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full bg-white border border-gray-200 focus:border-pink-500 rounded-xl px-3.5 py-2.5 font-semibold outline-none"
                        />
                      </div>
                      <p className="text-[11px] text-gray-400">Instant ₹50-₹150 cashback on eligible UPI apps.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Tab View */}
              {paymentMode === "card" && (
                <div className="space-y-4 animate-in fade-in text-xs">
                  {/* Visual Card Preview */}
                  <div className="w-full max-w-sm mx-auto h-40 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 p-4 text-white shadow-xl shadow-indigo-500/20 flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-pink-200">Platinum Debit Card</span>
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div className="font-mono text-base tracking-widest text-center">{cardDetails.number}</div>
                    <div className="flex justify-between items-end text-[10px]">
                      <div>
                        <p className="text-indigo-200">CARD HOLDER</p>
                        <p className="font-bold">{cardDetails.name}</p>
                      </div>
                      <div>
                        <p className="text-indigo-200">EXPIRES</p>
                        <p className="font-bold">{cardDetails.expiry}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <input
                      type="text"
                      placeholder="Card Number"
                      className="col-span-2 bg-white border border-gray-200 focus:border-pink-500 rounded-xl p-2.5 font-semibold"
                    />
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="bg-white border border-gray-200 focus:border-pink-500 rounded-xl p-2.5 font-semibold"
                    />
                    <input
                      type="password"
                      maxLength={3}
                      placeholder="CVV (3 Digits)"
                      className="bg-white border border-gray-200 focus:border-pink-500 rounded-xl p-2.5 font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* NetBanking View */}
              {paymentMode === "netbanking" && (
                <div className="space-y-3 animate-in fade-in text-xs">
                  <p className="font-bold text-gray-700">Select Popular Banks:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {["SBI Bank", "HDFC Bank", "ICICI Bank", "Axis Bank"].map((b) => (
                      <button
                        type="button"
                        key={b}
                        className="p-2 bg-white rounded-xl border border-gray-200 font-bold text-gray-700 hover:border-pink-500 hover:text-pink-600 transition"
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* COD View */}
              {paymentMode === "cod" && (
                <div className="space-y-2 animate-in fade-in text-xs text-gray-600">
                  <div className="flex items-center space-x-2 font-bold text-amber-600">
                    <Banknote className="w-5 h-5" />
                    <span>Cash on Delivery is available for this PIN Code!</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Aap parcel delivery boy se receive karte waqt Cash ya UPI QR scan karke payment kar sakte hain.
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Right Side: Order Summary & Coupon Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-xl shadow-pink-500/5 space-y-5">
            <h3 className="font-black text-gray-900 text-lg">Order Items ({items.length})</h3>

            {/* Product Mini Cards */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 scrollbar-none divide-y divide-gray-100">
              {items.map((prod) => {
                const finalUnitPrice = prod.finalPrice || calculateFinalPrice(prod.price, prod.discount);
                return (
                  <div key={prod.id} className="pt-3 first:pt-0 flex items-center space-x-3">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-14 h-14 object-cover rounded-xl border border-gray-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{prod.name}</h4>
                      <p className="text-[11px] text-gray-400">Qty: {prod.quantity || 1}</p>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-xs font-black text-gray-900">
                          ₹{(finalUnitPrice * (prod.quantity || 1)).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-gray-400 line-through">
                          ₹{((prod.price) * (prod.quantity || 1)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coupon Code Section */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Coupon (Try: KHA10)"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-pink-500 rounded-xl pl-9 pr-3 py-2 text-xs font-bold uppercase outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 bg-gray-900 text-white font-bold rounded-xl text-xs hover:bg-gray-800 transition"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="text-[11px] font-bold text-rose-500 mt-1">{couponError}</p>}
              {couponDiscount > 0 && (
                <p className="text-[11px] font-bold text-emerald-600 mt-1">
                  Coupon 'KHA10' Applied: Saved ₹{couponDiscount.toLocaleString()}!
                </p>
              )}
            </div>

            {/* Final Calculation Table */}
            <div className="border-t border-gray-100 pt-3 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Total Items MRP</span>
                <span>₹{originalTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-pink-600 font-semibold">
                <span>Product Instant Discount</span>
                <span>-₹{productSavings.toLocaleString()}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="text-emerald-600 font-bold">FREE EXPRESS</span>
              </div>

              <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center text-sm font-black text-gray-900">
                <span>Total Amount Payable</span>
                <span className="text-xl font-black bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
                  ₹{finalPayable.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Pay Button With Loader Animation */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 hover:from-violet-700 hover:via-pink-700 hover:to-amber-600 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-pink-500/30 active:scale-98 transition flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authorizing Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay ₹{finalPayable.toLocaleString()} Securely</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}