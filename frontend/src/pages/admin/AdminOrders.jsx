import React, { useState, useEffect } from "react";
import {
  Search,
  Clock,
  Truck,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Boxes,
  IndianRupee,
  X
} from "lucide-react";
import API from "../../api/axios";
import { getImageUrl } from "../../utils/productUtils";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [orderStatus, setOrderStatus] = useState("All");
  const [paymentStatus, setPaymentStatus] = useState("All");
  const [paymentMode, setPaymentMode] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  // Selected Order for Modal View & Updates
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateStatus, setUpdateStatus] = useState({ orderStatus: "", paymentStatus: "", notes: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  // Safe Date Formatter Helper (Fixes TypeError: Invalid option : timeStyle)
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        orderStatus,
        paymentStatus,
        paymentMode
      });

      const res = await API.get(`/orders?${params.toString()}`);
      setOrders(res.data?.data || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
      setTotalEntries(res.data?.pagination?.total || 0);
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Orders fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, itemsPerPage, orderStatus, paymentStatus, paymentMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchOrders();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleOpenDetailModal = (order) => {
    setSelectedOrder(order);
    setUpdateStatus({
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentInfo?.status || "Processing",
      notes: order.notes || ""
    });
  };

  const handleSaveStatus = async () => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      await API.put(`/orders/${selectedOrder._id}`, updateStatus);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await API.delete(`/orders/${id}`);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const getOrderStatusBadge = (status) => {
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

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "Verified":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Rejected":
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Processing":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Analytics KPIs */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Order Management & CRM</h1>
          <p className="text-xs text-gray-500 mt-1">
            Track customer deliveries, match UTR payments & manage inventory fulfillment.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400">Total Orders</span>
            <p className="text-lg font-black text-gray-900">{stats.totalOrders}</p>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400">Gross Revenue</span>
            <p className="text-lg font-black text-emerald-600">₹{stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400">Pending Orders</span>
            <p className="text-lg font-black text-amber-600">{stats.pendingOrders}</p>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400">Delivered</span>
            <p className="text-lg font-black text-blue-600">{stats.deliveredOrders}</p>
          </div>
        </div>
      </div>

      {/* 2. Controls: Search, Status Filters & Pagination Size */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search Order ID, Name, Phone, UTR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          </div>

          <select
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
            className="bg-gray-50 border border-gray-200 py-2.5 px-3 rounded-2xl font-bold text-gray-700 outline-none"
          >
            <option value="All">All Order Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="bg-gray-50 border border-gray-200 py-2.5 px-3 rounded-2xl font-bold text-gray-700 outline-none"
          >
            <option value="All">All Payment Statuses</option>
            <option value="Verified">Verified</option>
            <option value="Processing">Processing</option>
            <option value="Not Verified">Not Verified</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <span className="font-bold text-gray-500">Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="bg-gray-50 border border-gray-200 py-2 px-3 rounded-xl font-black text-gray-900 outline-none cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* 3. Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 uppercase text-gray-500 font-bold">
              <tr>
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer & Phone</th>
                <th className="p-4">Items</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment & UTR</th>
                <th className="p-4">Order Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-gray-400 font-bold">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-gray-400 font-bold">
                    No orders found matching your filters.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-gray-50/60 transition">
                    <td className="p-4">
                      <p className="font-black text-gray-900 font-mono">{ord.orderId}</p>
                      {/* Fixed Date formatting */}
                      <span className="text-[10px] text-gray-400">
                        {formatDateTime(ord.createdAt)}
                      </span>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-gray-900">{ord.shippingDetails?.name}</p>
                      <p className="text-[11px] text-gray-500">{ord.shippingDetails?.phone}</p>
                      <p className="text-[10px] text-gray-400 truncate max-w-xs">{ord.shippingDetails?.city}</p>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-gray-800">{ord.items?.length || 0} Product(s)</span>
                      </div>
                      <span className="text-[10px] text-gray-400 truncate block max-w-[140px]">
                        {ord.items?.[0]?.name}
                      </span>
                    </td>

                    <td className="p-4 font-black text-gray-900">
                      ₹{ord.pricing?.totalPayable?.toLocaleString()}
                    </td>

                    <td className="p-4">
                      <span className="uppercase font-bold text-[10px] block text-gray-600">
                        {ord.paymentInfo?.mode}
                      </span>
                      <p className="font-mono text-[10px] text-gray-500 truncate max-w-[120px]">
                        UTR: {ord.paymentInfo?.utrNumber}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black border ${getPaymentStatusBadge(
                          ord.paymentInfo?.status
                        )}`}
                      >
                        {ord.paymentInfo?.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black border ${getOrderStatusBadge(
                          ord.orderStatus
                        )}`}
                      >
                        {ord.orderStatus}
                      </span>
                    </td>

                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenDetailModal(ord)}
                        className="p-2 text-violet-600 hover:bg-violet-50 rounded-xl transition cursor-pointer"
                        title="View & Edit Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(ord._id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-gray-500">
          <div>
            Total Orders: <strong className="text-gray-900">{totalEntries}</strong>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-hidden">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg text-gray-900">
                  Order Details: <span className="font-mono text-pink-600">{selectedOrder.orderId}</span>
                </h3>
                <p className="text-xs text-gray-400">Placed on {formatDateTime(selectedOrder.createdAt)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-2xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Customer Address Details */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                <h4 className="font-black text-gray-900 uppercase tracking-wider text-[11px]">
                  Shipping & Delivery Address
                </h4>
                <div className="grid grid-cols-2 gap-3 text-gray-600">
                  <div>
                    <span className="font-bold text-gray-400 block text-[10px]">Recipient Name:</span>
                    <span className="font-extrabold text-gray-900">{selectedOrder.shippingDetails?.name}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-400 block text-[10px]">Mobile Contact:</span>
                    <span className="font-bold text-gray-900">{selectedOrder.shippingDetails?.phone}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-400 block text-[10px]">Email Address:</span>
                    <span>{selectedOrder.shippingDetails?.email}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-400 block text-[10px]">Destination:</span>
                    <span>
                      {selectedOrder.shippingDetails?.address}, {selectedOrder.shippingDetails?.city} -{" "}
                      {selectedOrder.shippingDetails?.pincode}, {selectedOrder.shippingDetails?.state}
                    </span>
                  </div>
                </div>
              </div>

              {/* Products in this order */}
              <div className="space-y-3">
                <h4 className="font-black text-gray-900 uppercase tracking-wider text-[11px]">Ordered Products</h4>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center space-x-3 bg-white">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{item.name}</p>
                        <p className="text-[11px] text-gray-400">
                          Qty: {item.quantity} × ₹{item.price?.toLocaleString()}
                        </p>
                      </div>
                      <div className="font-black text-gray-900">₹{item.total?.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Updater Box */}
              <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 space-y-3">
                <h4 className="font-black text-gray-900 uppercase tracking-wider text-[11px]">
                  Fulfillment & Payment Control
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-bold">
                  <div>
                    <label className="block text-gray-700 mb-1">Order Delivery Status</label>
                    <select
                      value={updateStatus.orderStatus}
                      onChange={(e) => setUpdateStatus({ ...updateStatus, orderStatus: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl p-2.5 outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled (Restores Stock)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">
                      Payment Verification (UTR: {selectedOrder.paymentInfo?.utrNumber})
                    </label>
                    <select
                      value={updateStatus.paymentStatus}
                      onChange={(e) => setUpdateStatus({ ...updateStatus, paymentStatus: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl p-2.5 outline-none"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Verified">Verified (Confirmed)</option>
                      <option value="Not Verified">Not Verified</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1 font-bold">Admin Internal Notes</label>
                  <input
                    type="text"
                    placeholder="Courier tracking id, verification notes, etc..."
                    value={updateStatus.notes}
                    onChange={(e) => setUpdateStatus({ ...updateStatus, notes: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 outline-none font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end space-x-2 bg-gray-50 rounded-b-3xl">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleSaveStatus}
                disabled={isUpdating}
                className="px-5 py-2 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? "Saving..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}