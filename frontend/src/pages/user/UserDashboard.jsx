// src/pages/user/UserDashboard.jsx (Key Updates)

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Search,
  ChevronLeft,
  ChevronRight,
  Printer,
  Edit2,
  ArrowRight,
  X,
  RotateCw,
  ShoppingBag
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import { getImageUrl } from "../../utils/productUtils";
import API from "../../api/axios";
import ProfileModal from "../../components/ProfileModal";

export default function UserDashboard() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const storeName = settings?.navbar?.brandName || "KHASTORE";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, deliveredOrders: 0 });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Fetch orders function
  const fetchUserOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);

      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        orderStatus: statusFilter
      });

      const res = await API.get(`/orders/my-orders?${params.toString()}`);
      setOrders(res.data?.data || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
      setTotalEntries(res.data?.pagination?.total || 0);
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Failed to load user orders:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial & Dependency Fetch
  useEffect(() => {
    fetchUserOrders();
  }, [currentPage, itemsPerPage, statusFilter]);

  // REAL-TIME SYNC: Har 6 seconds me background me status sync hota rahega
  useEffect(() => {
    const pollTimer = setInterval(() => {
      fetchUserOrders(true); // Silent background sync without showing full loading screen
    }, 6000);

    return () => clearInterval(pollTimer);
  }, [currentPage, itemsPerPage, statusFilter, searchTerm]);

  // Debounced search handler
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchUserOrders();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handlePrintSlip = () => {
    window.print();
  };

  const getProgressStep = (status) => {
    switch (status) {
      case "Pending":
        return 1;
      case "Processing":
        return 2;
      case "Shipped":
        return 3;
      case "Delivered":
        return 4;
      default:
        return 1;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Shipped":
      case "Processing":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Pending":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header Profile Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 p-6 sm:p-8 text-white shadow-xl shadow-pink-500/10">
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center font-black text-2xl uppercase shadow-md">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full border border-white/20">
                Verified Customer Account
              </span>
              <h1 className="text-2xl sm:text-3xl font-black">{user?.name}</h1>
              <p className="text-xs text-pink-100 flex items-center justify-center sm:justify-start space-x-2">
                <span>{user?.email}</span>
                <span>•</span>
                <span>{user?.mobile || user?.phone || "No Mobile Added"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-white text-gray-900 rounded-xl text-xs font-bold shadow-md hover:bg-gray-100 transition active:scale-95 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-pink-600" />
              <span>Edit Profile</span>
            </button>

            {/* Manual Sync Trigger */}
            <button
              onClick={() => fetchUserOrders(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-xl text-xs font-bold hover:bg-white/30 transition cursor-pointer"
              title="Sync Live Status"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Sync</span>
            </button>

            <Link
              to="/products"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-black/30 backdrop-blur-md text-white rounded-xl text-xs font-bold hover:bg-black/40 transition active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
              <span>Shop More</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Order Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400">Total Orders Placed</span>
            <p className="text-2xl font-black text-gray-900">{stats.totalOrders}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400">Orders in Progress</span>
            <p className="text-2xl font-black text-amber-600">{stats.pendingOrders}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400">Successfully Delivered</span>
            <p className="text-2xl font-black text-emerald-600">{stats.deliveredOrders}</p>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Order ID or Product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 py-2.5 px-3 rounded-2xl font-bold text-gray-700 outline-none w-full sm:w-auto cursor-pointer"
          >
            <option value="All">All Order Statuses</option>
            <option value="Pending">Pending Verification</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <span className="font-bold text-gray-500">Show per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="bg-gray-50 border border-gray-200 py-2 px-3 rounded-xl font-black text-gray-900 outline-none cursor-pointer"
          >
            <option value={5}>5 Orders</option>
            <option value={10}>10 Orders</option>
            <option value={20}>20 Orders</option>
          </select>
        </div>
      </div>

      {/* 4. Live Synced Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 font-bold text-gray-400">
            Loading your order history...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 space-y-4">
            <Package className="w-12 h-12 text-pink-500 mx-auto" />
            <h3 className="text-lg font-bold text-gray-900">Aapka Koi Order Nahi Mila</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Aapne abhi tak koi order place nahi kiya hai ya search filter se match nahi ho raha.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center space-x-1 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white rounded-xl text-xs font-bold shadow-md"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          orders.map((ord) => {
            const step = getProgressStep(ord.orderStatus);

            return (
              <div
                key={ord._id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-5 hover:shadow-md transition duration-200"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-black text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-md">
                        {ord.orderId}
                      </span>
                      <span className="text-xs text-gray-400">
                        Placed on {new Date(ord.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Payment Mode: <strong className="uppercase">{ord.paymentInfo?.mode}</strong> • Status:{" "}
                      <strong className="text-emerald-600">{ord.paymentInfo?.status}</strong>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 self-start sm:self-auto">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black border ${getStatusBadge(
                        ord.orderStatus
                      )}`}
                    >
                      {ord.orderStatus}
                    </span>
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      View Slip
                    </button>
                  </div>
                </div>

                {/* Real-Time Stepper Progress (Updates Live) */}
                {ord.orderStatus !== "Cancelled" && (
                  <div className="py-2">
                    <div className="relative flex items-center justify-between text-xs font-bold text-gray-400">
                      <div className="flex flex-col items-center z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-white ${
                            step >= 1 ? "bg-violet-600" : "bg-gray-200"
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] mt-1 ${step >= 1 ? "text-violet-600 font-black" : ""}`}>Order Placed</span>
                      </div>

                      <div className="flex flex-col items-center z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-white ${
                            step >= 2 ? "bg-pink-600" : "bg-gray-200"
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] mt-1 ${step >= 2 ? "text-pink-600 font-black" : ""}`}>Processing</span>
                      </div>

                      <div className="flex flex-col items-center z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-white ${
                            step >= 3 ? "bg-amber-500" : "bg-gray-200"
                          }`}
                        >
                          <Truck className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] mt-1 ${step >= 3 ? "text-amber-600 font-black" : ""}`}>Shipped</span>
                      </div>

                      <div className="flex flex-col items-center z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-white ${
                            step >= 4 ? "bg-emerald-600" : "bg-gray-200"
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] mt-1 ${step >= 4 ? "text-emerald-600 font-black" : ""}`}>Delivered</span>
                      </div>

                      <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-gray-200 z-0">
                        <div
                          className="h-full bg-gradient-to-r from-violet-600 via-pink-600 to-emerald-500 transition-all duration-500"
                          style={{ width: `${((step - 1) / 3) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="divide-y divide-gray-50 border border-gray-100 rounded-2xl overflow-hidden">
                  {ord.items?.map((it, idx) => (
                    <div key={idx} className="p-3 sm:p-4 flex items-center space-x-3.5">
                      <img
                        src={getImageUrl(it.image)}
                        alt={it.name}
                        className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        <h4 className="font-bold text-gray-900 truncate">{it.name}</h4>
                        <p className="text-[11px] text-gray-400">Qty: {it.quantity}</p>
                      </div>
                      <div className="text-right text-xs font-black text-gray-900">
                        ₹{Number(it.total).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Total */}
                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="text-gray-500 font-semibold">
                    Delivery to: <strong>{ord.shippingDetails?.city}</strong> ({ord.shippingDetails?.pincode})
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block">Total Amount Paid</span>
                    <span className="text-base font-black text-gray-900">
                      ₹{ord.pricing?.totalPayable?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Pagination Bar */}
        {totalEntries > itemsPerPage && (
          <div className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
            <span>
              Showing {orders.length} of {totalEntries} orders
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. View Slip Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-hidden">
          <style
            dangerouslySetInnerHTML={{
              __html: `
              @media print {
                body * { visibility: hidden !important; }
                #user-order-slip, #user-order-slip * { visibility: visible !important; }
                #user-order-slip {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 20px !important;
                  box-shadow: none !important;
                  border: none !important;
                }
                .no-print { display: none !important; }
              }
            `
            }}
          />

          <div
            id="user-order-slip"
            className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 my-auto animate-in zoom-in-95"
          >
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl no-print">
              <span className="text-xs font-black text-pink-600 uppercase tracking-wider">
                Official Order Receipt
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrintSlip}
                  className="px-3.5 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-xs">
              <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-xl font-black text-gray-900">{selectedOrder.orderId}</h3>
                  <p className="text-[11px] text-gray-400">
                    {new Date(selectedOrder.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-black text-base bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent uppercase">
                    {storeName}
                  </span>
                  <p className="text-[10px] text-gray-400">Official Store Receipt</p>
                </div>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 space-y-1">
                <p className="font-bold text-gray-500 uppercase text-[10px]">Shipped To:</p>
                <p className="font-extrabold text-gray-900">{selectedOrder.shippingDetails?.name}</p>
                <p className="text-gray-600">{selectedOrder.shippingDetails?.phone}</p>
                <p className="text-gray-600">
                  {selectedOrder.shippingDetails?.address}, {selectedOrder.shippingDetails?.city} -{" "}
                  {selectedOrder.shippingDetails?.pincode}
                </p>
                <p className="font-mono text-gray-500 pt-1">Payment Ref / UTR: {selectedOrder.paymentInfo?.utrNumber}</p>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-xs text-gray-700 uppercase">Items Summary</p>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden text-xs">
                  {selectedOrder.items?.map((it, idx) => (
                    <div key={idx} className="p-2.5 flex justify-between items-center bg-white">
                      <div>
                        <p className="font-bold text-gray-900">{it.name}</p>
                        <span className="text-[10px] text-gray-400">Qty: {it.quantity}</span>
                      </div>
                      <span className="font-black text-gray-900">₹{it.total?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-2 space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{selectedOrder.pricing?.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span>+₹{selectedOrder.pricing?.gstAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>{selectedOrder.pricing?.deliveryFee > 0 ? `₹${selectedOrder.pricing.deliveryFee}` : "FREE"}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-gray-900 border-t pt-1">
                  <span>Grand Total:</span>
                  <span className="text-pink-600">₹{selectedOrder.pricing?.totalPayable?.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-center text-[10px] text-gray-400 pt-2 border-t">
                Thank you for shopping with {storeName}!
              </p>
            </div>

            <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur-md px-6 py-3 border-t border-gray-100 flex justify-end rounded-b-3xl no-print">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Profile Edit Modal */}
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </div>
  );
}