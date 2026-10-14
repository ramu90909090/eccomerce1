import React from "react";
import { Check, Copy, Smartphone, ExternalLink, Info } from "lucide-react";

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
  return (
    <div className="bg-gradient-to-br from-gray-50 to-slate-100 p-5 rounded-3xl border border-gray-200 flex flex-col sm:flex-row items-center gap-6">
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-md flex flex-col items-center w-64 shrink-0">
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
          <span className="font-extrabold text-xs text-gray-800">{merchantName}</span>
        </div>

        <div className="w-44 h-44 rounded-2xl overflow-hidden border border-gray-100 bg-white p-1">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
              dynamicUpiUrl
            )}`}
            alt="Dynamic Payment QR Code"
            className="w-full h-full object-contain"
          />
        </div>

        <p className="font-mono text-xs font-bold text-gray-700 mt-2">{merchantUpiId}</p>

        <div className="mt-1 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 text-center w-full">
          <p className="text-[10px] text-gray-500 font-bold truncate">For: {productSummary}</p>
        </div>

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
  );
}