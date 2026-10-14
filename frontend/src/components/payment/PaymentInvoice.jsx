import React from "react";
import { CheckCircle2, Printer } from "lucide-react";
import { calculateFinalPrice, getImageUrl } from "../../utils/productUtils";

export default function PaymentInvoice({ finalOrderData, storeName, storeSubtitle, onBackHome }) {
  const handlePrint = () => {
    window.print();
  };

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
        <div className="flex items-center justify-between border-b pb-4 no-print">
          <div className="flex items-center space-x-2 text-emerald-600 font-black text-sm">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <span>Order Placed & Logged in Admin System</span>
          </div>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Download Slip</span>
          </button>
        </div>

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

        <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div>
            <p className="font-bold text-gray-400 uppercase text-[10px]">Customer Details</p>
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

        <div className="space-y-2">
          <h3 className="font-extrabold text-xs text-gray-700 uppercase tracking-wider">Ordered Items</h3>
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
            {finalOrderData.items.map((prod) => {
              const finalUnitPrice = prod.finalPrice || calculateFinalPrice(prod.price, prod.discount);
              const thumb = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images[0] : prod.image;
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
            onClick={onBackHome}
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