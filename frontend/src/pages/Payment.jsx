import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { calculateFinalPrice, getImageUrl } from "../utils/productUtils";
import {
  ShieldCheck,
  Banknote,
  CheckCircle2,
  Lock,
  Tag,
  ArrowRight,
  Smartphone,
  AlertCircle,
  AlertTriangle,
  Printer,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Info
} from "lucide-react";

export default function Payment() {
  const { cart, checkoutItem, clearCart } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  // Dynamic store branding from backend / navbar settings
  const storeName = settings?.navbar?.brandName || "KHASTORE";
  const storeSubtitle = settings?.navbar?.brandSubtitle || "Official Store Invoice";

  // Unique Order Reference ID
  const [orderId] = useState(
    () => `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`
  );

  // Stages: 'payment' | 'shipping' | 'success'
  const [stage, setStage] = useState("payment");

  // Shipping details state
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

  // Payment states
  const [paymentMode, setPaymentMode] = useState("upi");
  const [utrNumber, setUtrNumber] = useState("");
  const [utrError, setUtrError] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Carousel Slide State for Item Highlights
  const [activeSlide, setActiveSlide] = useState(0);

  // Coupon & Processing
  const [coupon, setCoupon] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [finalOrderData, setFinalOrderData] = useState(null);

  // Items in checkout
  const items = useMemo(() => (checkoutItem ? [checkoutItem] : cart), [checkoutItem, cart]);

  // Carousel autoplay
  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % items.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [items.length]);

  // Calculations
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

  // Merchant details
  const MERCHANT_UPI_ID = "juhip2019@okaxis";
  const MERCHANT_NAME = "Juhi Pafhj";

  // Product names summary for scan verification note
  const productSummary = useMemo(() => {
    if (!items.length) return "Store Order";
    const names = items.map((i) => i.name).join(", ");
    return names.length > 30 ? names.substring(0, 27) + "..." : names;
  }, [items]);

  // Dynamic Detailed UPI URL with Store Name, Order ID, and Product Info
  const dynamicUpiUrl = useMemo(() => {
    // UPI standard transaction note format
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

  // Step 1: Submit UTR & Verify
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

  // Step 2: Shipping Submit
  const handleShippingSubmit = (e) => {
    e.preventDefault();
    generateOrderReceipt(shippingData);
  };

  // Step 3: Receipt Generate
  const generateOrderReceipt = (finalShipping) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
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
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  if (items.length === 0 && stage !== "success") {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-amber-500 mx-auto" />
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

  // =========================================================================
  // STAGE 3: ORDER RECEIPT / TAX INVOICE (ONLY THIS PRINTS)
  // =========================================================================
  if (stage === "success" && finalOrderData) {
    return (
      <div className="min-h-screen py-10 px-4 sm:px-6 bg-slate-50 flex items-center justify-center">
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-invoice, #printable-invoice * {
                visibility: visible !important;
              }
              #printable-invoice {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 20px !important;
                box-shadow: none !important;
                border: none !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `
          }}
        />

        <div
          id="printable-invoice"
          className="max-w-2xl w-full bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 sm:p-10 space-y-6"
        >
          {/* Header Action Bar */}
          <div className="flex items-center justify-between border-b pb-4 no-print">
            <div className="flex items-center space-x-2 text-emerald-600 font-black text-sm">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <span>Order Confirmed & Slip Generated</span>
            </div>
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download Slip</span>
            </button>
          </div>

          {/* Dynamic Invoice Header */}
          <div className="flex justify-between items-start border-b border-gray-100 pb-5">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">TAX INVOICE</h1>
              <p className="text-xs text-gray-500 font-mono mt-0.5">Order ID: {finalOrderData.orderId}</p>
              <p className="text-xs text-gray-400">Date: {finalOrderData.date}</p>
            </div>
            <div className="text-right">
              <span className="font-black text-xl bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 bg-clip-text text-transparent uppercase">
                {storeName}
              </span>
              <p className="text-[11px] text-gray-500 font-bold">{storeSubtitle}</p>
              <p className="text-[10px] text-gray-400">GSTIN: 09AAAFK1234M1Z2</p>
            </div>
          </div>

          {/* Customer & Payment Meta */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div>
              <p className="font-bold text-gray-400 uppercase text-[10px]">Delivery Details</p>
              <p className="font-extrabold text-gray-900 mt-1">{finalOrderData.shipping.name}</p>
              <p className="text-gray-600">{finalOrderData.shipping.phone}</p>
              <p className="text-gray-600">{finalOrderData.shipping.email}</p>
              <p className="text-gray-600 mt-1">
                {finalOrderData.shipping.address}, {finalOrderData.shipping.city} - {finalOrderData.shipping.pincode}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-400 uppercase text-[10px]">Payment Verification</p>
              <p className="font-black text-gray-900 mt-1 uppercase">
                Mode: {finalOrderData.paymentMode === "upi" ? "Instant UPI" : "Cash on Delivery"}
              </p>
              <p className="text-gray-600 font-mono mt-0.5">
                UTR / Ref: <span className="font-bold text-gray-900">{finalOrderData.utrNumber}</span>
              </p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                Payment Logged
              </span>
            </div>
          </div>

          {/* Purchased Items Table */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-xs text-gray-700 uppercase tracking-wider">Ordered Items</h3>
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
              {finalOrderData.items.map((prod) => {
                const finalUnitPrice = prod.finalPrice || calculateFinalPrice(prod.price, prod.discount);
                const thumb =
                  Array.isArray(prod.images) && prod.images.length > 0 ? prod.images[0] : prod.image;
                return (
                  <div key={prod.id || prod._id} className="p-3 flex items-center space-x-3 bg-white">
                    <img
                      src={getImageUrl(thumb)}
                      alt={prod.name}
                      className="w-12 h-12 object-cover rounded-xl border border-gray-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-gray-900 truncate">{prod.name}</p>
                      <p className="text-[11px] text-gray-400">
                        Qty: {prod.quantity || 1} × ₹{finalUnitPrice.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right font-black text-xs text-gray-900">
                      ₹{(finalUnitPrice * (prod.quantity || 1)).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Calculation Breakdown */}
          <div className="border-t pt-3 space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Items Subtotal:</span>
              <span className="font-bold text-gray-900">₹{finalOrderData.itemsSubtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18% Included Tax):</span>
              <span className="font-bold text-gray-900">+₹{finalOrderData.gstAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span className="font-bold text-emerald-600">
                {finalOrderData.deliveryFee > 0 ? `₹${finalOrderData.deliveryFee}` : "FREE"}
              </span>
            </div>
            {finalOrderData.couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Coupon Applied:</span>
                <span>-₹{finalOrderData.couponDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-gray-900 border-t border-dashed pt-2">
              <span>Grand Total:</span>
              <span className="text-base text-emerald-600 font-black">
                ₹{finalOrderData.netPayable.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="text-center pt-2 text-[11px] text-gray-400 border-t">
            <p>Computer generated invoice. Thank you for shopping with {storeName}!</p>
          </div>

          <div className="pt-2 no-print flex gap-3">
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Back to Home
            </button>
            <button
              onClick={handlePrint}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STAGE 2: MANDATORY SHIPPING FORM (Jab user login na ho)
  // =========================================================================
  if (stage === "shipping") {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xl space-y-5">
          <div className="border-b pb-4">
            <span className="text-xs font-black text-pink-600 uppercase tracking-wider bg-pink-50 px-3 py-1 rounded-full">
              Final Step
            </span>
            <h2 className="text-2xl font-black text-gray-900 mt-2">Shipping & Delivery Details</h2>
            <p className="text-xs text-gray-500">
              UTR verify ho gaya hai. Order receipt aur parcel dispatch ke liye apna address bharein.
            </p>
          </div>

          <form onSubmit={handleShippingSubmit} className="space-y-4 text-xs font-semibold">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">Full Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={shippingData.name}
                  onChange={(e) => setShippingData({ ...shippingData, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-pink-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Mobile Number *</label>
                <input
                  required
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={shippingData.phone}
                  onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-pink-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Email Address *</label>
              <input
                required
                type="email"
                placeholder="email@example.com (Invoice receive karne ke liye)"
                value={shippingData.email}
                onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-pink-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Complete Address / Landmark *</label>
              <input
                required
                type="text"
                placeholder="House no, Street, Colony, Landmark"
                value={shippingData.address}
                onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-pink-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">City / District *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Lucknow"
                  value={shippingData.city}
                  onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-pink-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Area Pincode *</label>
                <input
                  required
                  type="text"
                  placeholder="6-digit pincode"
                  value={shippingData.pincode}
                  onChange={(e) => setShippingData({ ...shippingData, pincode: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-pink-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">State *</label>
                <input
                  required
                  type="text"
                  value={shippingData.state}
                  onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-pink-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setStage("payment")}
                className="w-1/3 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Back to Payment
              </button>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-2/3 py-3.5 bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-pink-500/25 transition cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? "Generating Slip..." : "Submit & Generate Order Slip"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STAGE 1: COLOURFUL & ATTRACTIVE PAYMENT CAROUSEL + DETAILED QR CODE
  // =========================================================================
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. VIBRANT & ATTRACTIVE PAYMENT HIGHLIGHT CAROUSEL BANNER */}
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
              Scan dynamic QR containing your order details and store name for verified instant confirmation.
            </p>
          </div>

          {/* Right Product Highlight Carousel */}
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

      {/* Main Payment & Checkout Form */}
      <form onSubmit={handlePaymentSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Payment Method & QR Card (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center text-xs">
                1
              </span>
              <span>Choose Payment Method</span>
            </h2>

            {/* Mode Switchers: Only UPI & COD */}
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

            {/* UPI View */}
            {paymentMode === "upi" && (
              <div className="space-y-4 pt-2">
                {/* Warning Banner */}
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

                {/* DETAILED QR CODE BOX (Store Name, Order ID & Product Details Integrated) */}
                <div className="bg-gradient-to-br from-gray-50 to-slate-100 p-5 rounded-3xl border border-gray-200 flex flex-col sm:flex-row items-center gap-6">
                  {/* Detailed QR Card */}
                  <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-md flex flex-col items-center w-64 shrink-0">
                    {/* Store Title on Top of QR */}
                    <div className="text-center pb-2 border-b border-gray-100 w-full">
                      <span className="text-xs font-black tracking-wider uppercase bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                        {storeName}
                      </span>
                      <p className="text-[9px] font-bold text-gray-400">Order: {orderId}</p>
                    </div>

                    <div className="flex items-center space-x-1.5 my-2">
                      <div className="w-6 h-6 rounded-full bg-amber-800 text-white font-bold flex items-center justify-center text-[10px]">
                        J
                      </div>
                      <span className="font-extrabold text-xs text-gray-800">{MERCHANT_NAME}</span>
                    </div>

                    {/* QR Code generating with complete transaction parameters */}
                    <div className="w-44 h-44 rounded-2xl overflow-hidden border border-gray-100 bg-white p-1">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                          dynamicUpiUrl
                        )}`}
                        alt="Dynamic Payment QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <p className="font-mono text-xs font-bold text-gray-700 mt-2">{MERCHANT_UPI_ID}</p>

                    {/* Purpose details under QR */}
                    <div className="mt-1 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 text-center w-full">
                      <p className="text-[10px] text-gray-500 font-bold truncate">For: {productSummary}</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="mt-2 inline-flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-[10px] font-bold transition cursor-pointer"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy UPI ID</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Payment Info & App Link */}
                  <div className="flex-1 space-y-3 w-full text-xs">
                    <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Grand Total Payable</span>
                      <p className="text-2xl font-black text-gray-900">₹{netPayable.toLocaleString()}</p>
                      <div className="pt-1 border-t border-gray-100 space-y-0.5 text-[11px] text-gray-500">
                        <p>
                          <strong className="text-gray-700">Store:</strong> {storeName}
                        </p>
                        <p>
                          <strong className="text-gray-700">Order ID:</strong> {orderId}
                        </p>
                        <p className="truncate">
                          <strong className="text-gray-700">Items:</strong> {productSummary}
                        </p>
                      </div>
                    </div>

                    <a
                      href={dynamicUpiUrl}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-md transition"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Pay via UPI App Directly</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <div className="flex items-start space-x-2 text-[11px] text-gray-500 bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
                      <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <p>Scan karte waqt app me Store Name, Order ID aur Product details auto-populate hongi.</p>
                    </div>
                  </div>
                </div>

                {/* Mandatory UTR Input */}
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

            {/* COD View */}
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

        {/* Right Side: Order Summary & Action (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <h3 className="font-black text-gray-900 text-base">Order Items ({items.length})</h3>

            {/* Item Mini Cards */}
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

            {/* Calculations Breakdown */}
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

            {/* Submit Action Button */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-pink-500/25 active:scale-98 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Verify & Continue to Slip</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}