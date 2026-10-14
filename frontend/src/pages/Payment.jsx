import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { calculateFinalPrice, getImageUrl } from "../utils/productUtils";
import API from "../api/axios";
import {
  Banknote,
  Lock,
  Tag,
  ArrowRight,
  Smartphone,
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";

import PaymentInvoice from "../components/payment/PaymentInvoice";
import PaymentShippingForm from "../components/payment/PaymentShippingForm";
import PaymentQrCard from "../components/payment/PaymentQrCard";

export default function Payment() {
  const { cart, checkoutItem, clearCart } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const storeName = settings?.navbar?.brandName || "KHASTORE";
  const storeSubtitle = settings?.navbar?.brandSubtitle || "Official Store Invoice";

  const [orderId] = useState(
    () => `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`
  );

  const [stage, setStage] = useState("payment");

  const [shippingData, setShippingData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
    state: "Uttar Pradesh"
  });

  useEffect(() => {
    if (user) {
      setShippingData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        pincode: user.pincode || "",
        state: user.state || "Uttar Pradesh"
      });
    }
  }, [user]);

  const [paymentMode, setPaymentMode] = useState("upi");
  const [utrNumber, setUtrNumber] = useState("");
  const [utrError, setUtrError] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const [coupon, setCoupon] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [finalOrderData, setFinalOrderData] = useState(null);

  const items = useMemo(() => (checkoutItem ? [checkoutItem] : cart), [checkoutItem, cart]);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % items.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [items.length]);

  const itemsSubtotal = useMemo(() => {
    return items.reduce((acc, it) => {
      const finalUnit = it.finalPrice || calculateFinalPrice(it.price, it.discount);
      return acc + finalUnit * (it.quantity || 1);
    }, 0);
  }, [items]);

  const deliveryFee = itemsSubtotal < 1000 && itemsSubtotal > 0 ? 50 : 0;
  const gstAmount = Math.round(itemsSubtotal * 0.18);
  const netPayable = Math.max(0, itemsSubtotal + gstAmount + deliveryFee - couponDiscount);
  const isCodEligible = itemsSubtotal > 5000;

  const MERCHANT_UPI_ID = "juhip2019@okaxis";
  const MERCHANT_NAME = "Juhi Pafhj";

  const productSummary = useMemo(() => {
    if (!items.length) return "Store Order";
    const names = items.map((i) => i.name).join(", ");
    return names.length > 30 ? names.substring(0, 27) + "..." : names;
  }, [items]);

  const dynamicUpiUrl = useMemo(() => {
    const transactionNote = `${storeName} | ${orderId} | ${productSummary}`;
    return `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(
      MERCHANT_NAME
    )}&am=${netPayable}&cu=INR&tr=${orderId}&tn=${encodeURIComponent(transactionNote)}`;
  }, [storeName, MERCHANT_UPI_ID, MERCHANT_NAME, netPayable, orderId, productSummary]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(MERCHANT_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (coupon.trim().toUpperCase() === "KHA10") {
      const discount = Math.round(itemsSubtotal * 0.1);
      setCouponDiscount(discount);
      setCouponError("");
    } else {
      setCouponError("Invalid code. Use 'KHA10' to get 10% off.");
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();

    if (paymentMode === "upi") {
      if (!utrNumber.trim()) {
        setUtrError("Payment verification ke liye 12-digit UTR No. daalna anivarya hai.");
        return;
      }
      if (utrNumber.trim().length < 8) {
        setUtrError("Kripya valid 8-12 digit UTR / Reference No. enter karein.");
        return;
      }
    }

    if (paymentMode === "cod" && !isCodEligible) {
      alert("Cash on Delivery sirf ₹5,000 se upar ke order par uplabdh hai.");
      return;
    }

    setUtrError("");

    const hasAddress =
      user &&
      shippingData.name.trim() &&
      shippingData.phone.trim() &&
      shippingData.address.trim() &&
      shippingData.pincode.trim();

    if (hasAddress) {
      generateOrderReceipt(shippingData);
    } else {
      setStage("shipping");
    }
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    generateOrderReceipt(shippingData);
  };

  const generateOrderReceipt = async (finalShipping) => {
    setIsProcessing(true);
    try {
      const orderPayload = {
        orderId,
        items,
        shippingDetails: finalShipping,
        paymentInfo: {
          mode: paymentMode,
          utrNumber: paymentMode === "upi" ? utrNumber.trim() : "COD-PENDING"
        },
        pricing: {
          subtotal: itemsSubtotal,
          gstAmount,
          deliveryFee,
          couponDiscount,
          totalPayable: netPayable
        },
        userId: user?._id || null
      };

      await API.post("/orders", orderPayload);

      setFinalOrderData({
        orderId,
        date: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
        items,
        shipping: finalShipping,
        paymentMode,
        utrNumber: paymentMode === "upi" ? utrNumber.trim() : "COD-PENDING",
        itemsSubtotal,
        gstAmount,
        deliveryFee,
        couponDiscount,
        netPayable
      });

      setStage("success");
      if (!checkoutItem) clearCart();
    } catch (err) {
      alert(err.response?.data?.message || "Order creation failed. Please check stock.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && stage !== "success") {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-amber-500 mx-auto animate-bounce" />
        <h2 className="text-2xl font-black text-gray-900">Checkout Khali Hai</h2>
        <p className="text-xs text-gray-500">Cart me product add karein ya direct 'Buy Now' click karein.</p>
        <button
          onClick={() => navigate("/products")}
          className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
        >
          Browse Products
        </button>
      </div>
    );
  }

  if (stage === "success" && finalOrderData) {
    return (
      <PaymentInvoice
        finalOrderData={finalOrderData}
        storeName={storeName}
        storeSubtitle={storeSubtitle}
        onBackHome={() => navigate("/")}
      />
    );
  }

  if (stage === "shipping") {
    return (
      <PaymentShippingForm
        shippingData={shippingData}
        setShippingData={setShippingData}
        onSubmit={handleShippingSubmit}
        onBack={() => setStage("payment")}
        isProcessing={isProcessing}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 p-6 sm:p-8 text-white shadow-2xl shadow-pink-500/20">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-amber-400/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-3">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider text-amber-300 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Fast 1-Click Verification Checkout</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Pay ₹{netPayable.toLocaleString()} Securely
            </h1>
            <p className="text-pink-100 text-xs sm:text-sm max-w-lg leading-relaxed">
              Scan dynamic QR containing order details and store name for verified instant confirmation.
            </p>
          </div>

          <div className="md:col-span-5 relative">
            {items.length > 0 && (
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-4 shadow-xl flex items-center space-x-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/20 shrink-0 border border-white/40">
                  <img
                    src={getImageUrl(
                      Array.isArray(items[activeSlide]?.images) && items[activeSlide]?.images.length > 0
                        ? items[activeSlide]?.images[0]
                        : items[activeSlide]?.image
                    )}
                    alt={items[activeSlide]?.name}
                    className="w-full h-full object-cover transform hover:scale-110 transition duration-300"
                  />
                </div>

                <div className="flex-1 min-w-0 text-white">
                  <span className="text-[10px] font-extrabold uppercase bg-amber-400/30 text-amber-200 px-2 py-0.5 rounded-full border border-amber-300/30">
                    Item {activeSlide + 1} of {items.length}
                  </span>
                  <h4 className="font-black text-xs sm:text-sm truncate mt-1">{items[activeSlide]?.name}</h4>
                  <p className="text-[11px] text-pink-200 font-bold">Qty: {items[activeSlide]?.quantity || 1}</p>
                  <p className="text-sm font-black text-amber-300 mt-0.5">
                    ₹{(
                      (items[activeSlide]?.finalPrice ||
                        calculateFinalPrice(items[activeSlide]?.price, items[activeSlide]?.discount)) *
                      (items[activeSlide]?.quantity || 1)
                    ).toLocaleString()}
                  </p>
                </div>

                {items.length > 1 && (
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveSlide((prev) => (prev - 1 + items.length) % items.length)}
                      className="p-1 rounded-lg bg-white/20 hover:bg-white/40 text-white cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSlide((prev) => (prev + 1) % items.length)}
                      className="p-1 rounded-lg bg-white/20 hover:bg-white/40 text-white cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handlePaymentSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center text-xs">
                1
              </span>
              <span>Choose Payment Method</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMode("upi")}
                className={`p-4 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-1.5 cursor-pointer ${
                  paymentMode === "upi"
                    ? "border-pink-500 bg-pink-50/70 shadow-md shadow-pink-500/10 scale-102"
                    : "border-gray-200 hover:border-gray-300 bg-gray-50/60"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-sm">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-gray-900">Instant UPI Payment</span>
                <span className="text-[10px] text-emerald-600 font-bold">Fast Auto Invoice</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isCodEligible) setPaymentMode("cod");
                  else alert("Cash on Delivery sirf ₹5,000 se upar ke order par uplabdh hai.");
                }}
                className={`p-4 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-1.5 cursor-pointer ${
                  !isCodEligible
                    ? "opacity-40 border-gray-200 bg-gray-100 cursor-not-allowed"
                    : paymentMode === "cod"
                    ? "border-amber-500 bg-amber-50/70 shadow-md shadow-amber-500/10 scale-102"
                    : "border-gray-200 hover:border-gray-300 bg-gray-50/60"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-sm">
                  <Banknote className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-gray-900">Cash on Delivery</span>
                <span className="text-[10px] text-gray-500">
                  {isCodEligible ? "Available (> ₹5,000)" : "Min ₹5,000 required"}
                </span>
              </button>
            </div>

            {paymentMode === "upi" && (
              <div className="space-y-4 pt-2">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start space-x-3 text-xs text-amber-900">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-black text-amber-800">Payment ID Verification Alert:</p>
                    <p className="text-[11px] leading-relaxed">
                      Payment karte waqt verify karein ki receiver UPI ID <strong>{MERCHANT_UPI_ID}</strong> (Name:{" "}
                      <strong>{MERCHANT_NAME}</strong>) hi show ho rahi ho.
                    </p>
                  </div>
                </div>

                <PaymentQrCard
                  storeName={storeName}
                  orderId={orderId}
                  merchantName={MERCHANT_NAME}
                  merchantUpiId={MERCHANT_UPI_ID}
                  dynamicUpiUrl={dynamicUpiUrl}
                  productSummary={productSummary}
                  netPayable={netPayable}
                  copiedUpi={copiedUpi}
                  onCopyUpi={handleCopyUpi}
                />

                <div className="p-4 bg-pink-50/60 rounded-2xl border border-pink-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="font-black text-xs text-gray-900">
                      Bank Transaction UTR / Ref No. * (Mandatory)
                    </label>
                    <span className="text-[10px] font-bold text-pink-600 bg-white px-2 py-0.5 rounded-md border border-pink-200">
                      Order Receipt Verification
                    </span>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Enter 12-digit UTR No. (e.g. 428731908234)"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="w-full bg-white border border-gray-300 focus:border-pink-500 rounded-xl px-3.5 py-2.5 font-mono font-bold text-xs outline-none"
                  />

                  {utrError && <p className="text-[11px] font-black text-rose-600">{utrError}</p>}
                </div>
              </div>
            )}

            {paymentMode === "cod" && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1 text-xs text-amber-900">
                <p className="font-bold flex items-center space-x-1.5">
                  <Banknote className="w-4 h-4 text-amber-600" />
                  <span>Cash on Delivery is Active!</span>
                </p>
                <p className="text-[11px] text-gray-600">
                  Parcel receive karte samay delivery agent ko cash ya UPI QR se pay kar sakte hain.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <h3 className="font-black text-gray-900 text-base">Order Items ({items.length})</h3>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-gray-100">
              {items.map((prod) => {
                const finalUnitPrice = prod.finalPrice || calculateFinalPrice(prod.price, prod.discount);
                const thumb =
                  Array.isArray(prod.images) && prod.images.length > 0 ? prod.images[0] : prod.image;
                const qty = prod.quantity || 1;

                return (
                  <div key={prod.id || prod._id} className="pt-3 first:pt-0 flex items-center space-x-3">
                    <img
                      src={getImageUrl(thumb)}
                      alt={prod.name}
                      className="w-12 h-12 object-cover rounded-xl border border-gray-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{prod.name}</h4>
                      <p className="text-[11px] text-gray-400">Qty: {qty}</p>
                    </div>
                    <div className="text-right text-xs font-black text-gray-900">
                      ₹{(finalUnitPrice * qty).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>

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
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-xs transition cursor-pointer"
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

            <div className="border-t border-gray-100 pt-3 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>₹{itemsSubtotal.toLocaleString()}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{couponDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>GST (18% Government Tax)</span>
                <span className="font-bold text-gray-900">+₹{gstAmount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Charges</span>
                {deliveryFee > 0 ? (
                  <span className="font-bold text-amber-600">+₹50 (Cart &lt; ₹1,000)</span>
                ) : (
                  <span className="text-emerald-600 font-bold">FREE</span>
                )}
              </div>

              <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center text-sm font-black text-gray-900">
                <span>Total Amount Payable</span>
                <span className="text-2xl font-black bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
                  ₹{netPayable.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-pink-500/25 active:scale-98 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isProcessing ? "Processing..." : "Verify & Continue"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}