import React from "react";

export default function PaymentShippingForm({
  shippingData,
  setShippingData,
  onSubmit,
  onBack,
  isProcessing
}) {
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

        <form onSubmit={onSubmit} className="space-y-4 text-xs font-semibold">
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
              onClick={onBack}
              className="w-1/3 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Back to Payment
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-2/3 py-3.5 bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-pink-500/25 transition cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? "Placing Order..." : "Submit & Generate Order Slip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}