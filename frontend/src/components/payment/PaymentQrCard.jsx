import React from "react";
import { Check, Copy, Smartphone, ExternalLink, Info } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function PaymentQrCard({
  storeName,
  orderId,
  merchantName,
  merchantUpiId,
  dynamicUpiUrl,
  productSummary,
  netPayable,
  copiedUpi,
  onCopyUpi
}) {
  const initial = merchantName ? merchantName.trim().charAt(0).toUpperCase() : "U";

  return (
    <div className="bg-gradient-to-br from-gray-50 to-slate-100 p-5 rounded-3xl border border-gray-200 flex flex-col sm:flex-row items-center gap-6">
      {/* 1. Dynamic Auto-Amount QR Card */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-md flex flex-col items-center w-64 shrink-0">
        
        {/* Store Title */}
        <div className="text-center pb-2 border-b border-gray-100 w-full">
          <span className="text-xs font-black tracking-wider uppercase bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
            {storeName}
          </span>
          <p className="text-[9px] font-bold text-gray-400">Order Ref: {orderId}</p>
        </div>

        {/* Receiver Name */}
        <div className="flex items-center space-x-1.5 my-2">
          <div className="w-6 h-6 rounded-full bg-amber-800 text-white font-bold flex items-center justify-center text-[10px]">
            {initial}
          </div>
          <span className="font-extrabold text-xs text-gray-800">{merchantName}</span>
        </div>

        {/* Live Vector QR Code with Pre-filled Amount */}
        <div className="w-44 h-44 rounded-2xl overflow-hidden border border-gray-200 bg-white p-2.5 flex items-center justify-center shadow-inner">
          <QRCodeSVG
            value={dynamicUpiUrl}
            size={160}
            level="H"
            includeMargin={false}
          />
        </div>

        {/* Pre-filled Amount Highlight */}
        <div className="mt-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl text-center w-full">
          <span className="text-[10px] text-emerald-700 font-bold block">Scan karne par amount aayega:</span>
          <span className="text-xs font-black text-emerald-800">₹{netPayable.toLocaleString()}</span>
        </div>

        <p className="font-mono text-xs font-bold text-gray-700 mt-2">{merchantUpiId}</p>

        {/* Copy UPI Button */}
        <button
          type="button"
          onClick={onCopyUpi}
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

      {/* 2. Payment Summary & App Deep Link */}
      <div className="flex-1 space-y-3 w-full text-xs">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Total Payable (Including GST & Delivery)
          </span>
          <p className="text-3xl font-black text-gray-900">₹{netPayable.toLocaleString()}</p>
          
          <div className="pt-2 border-t border-gray-100 space-y-1 text-[11px] text-gray-600">
            <p className="flex justify-between">
              <span className="text-gray-400">Order ID:</span>
              <span className="font-mono font-bold text-gray-900">{orderId}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-400">Merchant Name:</span>
              <span className="font-bold text-gray-900">{merchantName}</span>
            </p>
            <p className="flex justify-between truncate">
              <span className="text-gray-400">Product:</span>
              <span className="font-bold text-gray-900 truncate max-w-[150px]">{productSummary}</span>
            </p>
          </div>
        </div>

        {/* Mobile Deep Link */}
        <a
          href={dynamicUpiUrl}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 text-white font-black rounded-xl flex items-center justify-center space-x-2 shadow-md transition"
        >
          <Smartphone className="w-4 h-4" />
          <span>Pay ₹{netPayable.toLocaleString()} via GPay / PhonePe / Paytm</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <div className="flex items-start space-x-2 text-[11px] text-emerald-800 bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            Jaise hi aap PhonePe ya GPay se yeh QR scan karenge, <strong>₹{netPayable.toLocaleString()}</strong> ka amount bina type kiye automatically screen par bhara hua aayega!
          </p>
        </div>
      </div>
    </div>
  );
}