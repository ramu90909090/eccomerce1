import React, { useState, useEffect } from "react";
import {
  Smartphone,
  QrCode,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCw,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  RefreshCw,
  Power,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import API from "../../api/axios";

export default function AdminWhatsappLogs() {
  const [session, setSession] = useState({
    status: "DISCONNECTED",
    qrCode: "",
    connectedNumber: ""
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({ sentCount: 0, pendingCount: 0, failedCount: 0, notReachableCount: 0 });

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [triggerFilter, setTriggerFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  // Bulk Multi-Select & Modal
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewingMessage, setViewingMessage] = useState(null);

  const fetchSessionStatus = async () => {
    try {
      const res = await API.get("/whatsapp/status");
      setSession(res.data);
    } catch (err) {
      console.error("Session check error:", err);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
        triggerType: triggerFilter
      });

      const res = await API.get(`/whatsapp/logs?${params.toString()}`);
      setLogs(res.data?.data || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
      setTotalEntries(res.data?.pagination?.total || 0);
      if (res.data?.stats) setStats(res.data.stats);
    } catch (err) {
      console.error("Fetch logs error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionStatus();
    const interval = setInterval(fetchSessionStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, itemsPerPage, statusFilter, triggerFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchLogs();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Action 1: Purane Session se Reconnect
  const handleReconnectExisting = async () => {
    setActionLoading(true);
    try {
      const res = await API.post("/whatsapp/reconnect");
      alert(res.data?.message || "Reconnecting to existing session...");
      fetchSessionStatus();
    } catch (err) {
      alert("Reconnect failed: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  // Action 2: New Session (Clears old session & deletes all old logs)
  const handleStartNewSession = async () => {
    if (
      !window.confirm(
        "Naya session shuru karne se purana session disconnect ho jayega aur DATABASE KE SARE PURANE WHATSAPP LOGS DELETE HO JAYENGE. Kya aap continue karna chahte hain?"
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await API.post("/whatsapp/new-session");
      alert(res.data?.message || "Old session & logs cleared. Fresh QR is generating...");
      fetchSessionStatus();
      fetchLogs();
    } catch (err) {
      alert("New session initialization failed: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  // Action 3: Disconnect current session
  const handleDisconnect = async () => {
    if (!window.confirm("Active WhatsApp session disconnect karna chahte hain?")) return;
    setActionLoading(true);
    try {
      await API.post("/whatsapp/logout");
      fetchSessionStatus();
    } catch (err) {
      alert("Disconnect failed: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(logs.map((l) => l._id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Kya aap ${selectedIds.length} chune huye logs delete karna chahte hain?`)) return;

    try {
      await API.post("/whatsapp/bulk-delete", { ids: selectedIds });
      setSelectedIds([]);
      fetchLogs();
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleRetry = async (id) => {
    try {
      await API.post(`/whatsapp/retry/${id}`);
      fetchLogs();
    } catch (err) {
      alert("Retry failed");
    }
  };

  const isConnected = session.status === "READY";
  const isReconnecting = session.status === "RECONNECTING";

  return (
    <div className="space-y-6">
      {/* 1. Header with Session Controls */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Smartphone className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-black text-gray-900">WhatsApp Engine Manager</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Connected Admin Number:{" "}
            <strong className="text-gray-900 font-mono">
              {session.connectedNumber ? `+${session.connectedNumber}` : "Not Logged In"}
            </strong>
          </p>
        </div>

        {/* Action Buttons & Status Pill */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Indicator */}
          <span
            className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 border ${
              isConnected
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : isReconnecting
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected
                  ? "bg-emerald-500 animate-pulse"
                  : isReconnecting
                  ? "bg-blue-500 animate-spin"
                  : "bg-amber-500"
              }`}
            />
            <span>
              {isConnected
                ? "Connected & Live"
                : isReconnecting
                ? "Reconnecting Session..."
                : session.status === "QR_READY"
                ? "Scan QR Code"
                : "Disconnected"}
            </span>
          </span>

          {/* Button 1: Purane Session se Reconnect */}
          {!isConnected && (
            <button
              onClick={handleReconnectExisting}
              disabled={actionLoading || isReconnecting}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"
              title="Saved credentials se reconnect karein"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? "animate-spin" : ""}`} />
              <span>Reconnect Old Session</span>
            </button>
          )}

          {/* Button 2: Naya Session (Clean Logs + Fresh QR) */}
          <button
            onClick={handleStartNewSession}
            disabled={actionLoading}
            className="px-3.5 py-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:opacity-95 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"
            title="Purane logs aur session delete karke naya QR generate karein"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Start New Session (Fresh QR)</span>
          </button>

          {/* Button 3: Disconnect */}
          {isConnected && (
            <button
              onClick={handleDisconnect}
              disabled={actionLoading}
              className="px-3.5 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-rose-200 transition cursor-pointer"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. QR Scanner Box (Visible when not ready) */}
      {!isConnected && (
        <div className="bg-gradient-to-br from-gray-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center gap-6">
          <div className="w-56 h-56 bg-white rounded-2xl p-3 flex items-center justify-center shrink-0 shadow-lg">
            {session.qrCode ? (
              <img src={session.qrCode} alt="WhatsApp QR Code" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center text-gray-500 text-xs font-bold space-y-2">
                <RotateCw className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                <p>{isReconnecting ? "Auto reconnecting..." : "Generating New Session QR..."}</p>
              </div>
            )}
          </div>

          <div className="space-y-3 text-xs leading-relaxed max-w-lg">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30">
              Session Automation
            </span>
            <h2 className="text-xl sm:text-2xl font-black">Link WhatsApp Account</h2>
            <ol className="list-decimal list-inside space-y-1 text-gray-300">
              <li>Phone me WhatsApp kholein &gt; <strong>Linked Devices</strong>.</li>
              <li><strong>Link a Device</strong> click karke is QR ko scan karein.</li>
              <li>
                Agar connection drop hota hai, to system automatically purane session se judne ki koshish karega.
              </li>
              <li>
                Naya account link karne ke liye upar <strong>"Start New Session"</strong> dabayein, jisse puraane logs
                saaf hokar naya QR aayega.
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* 3. Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400">Delivered</span>
            <p className="text-lg font-black text-emerald-600">{stats.sentCount}</p>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400">Pending Queue</span>
            <p className="text-lg font-black text-amber-600">{stats.pendingCount}</p>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <RotateCw className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400">Retrying (Failed)</span>
            <p className="text-lg font-black text-rose-600">{stats.failedCount}</p>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400">Not Reachable</span>
            <p className="text-lg font-black text-gray-800">{stats.notReachableCount}</p>
          </div>
        </div>
      </div>

      {/* 4. Filter Toolbar & Multi-Delete */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search Order ID or Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 py-2 px-3 rounded-xl font-bold text-gray-700 outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Sent">Sent</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed (Retrying)</option>
            <option value="Not Reachable">Not Reachable</option>
          </select>

          <select
            value={triggerFilter}
            onChange={(e) => setTriggerFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 py-2 px-3 rounded-xl font-bold text-gray-700 outline-none cursor-pointer"
          >
            <option value="All">All Events</option>
            <option value="order_placed">Order Placed</option>
            <option value="status_updated">Status Updated</option>
          </select>

          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-3.5 py-2 bg-rose-600 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-md hover:bg-rose-700 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <span className="font-bold text-gray-400">Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="bg-gray-50 border border-gray-200 py-1.5 px-3 rounded-xl font-black text-gray-800 outline-none cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* 5. Logs Table with Multi-Delete Checkboxes */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 uppercase text-gray-500 font-bold">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={logs.length > 0 && selectedIds.length === logs.length}
                    className="accent-emerald-600 rounded cursor-pointer"
                  />
                </th>
                <th className="p-4">Order & Trigger</th>
                <th className="p-4">Recipient Phone</th>
                <th className="p-4">Delivery Status</th>
                <th className="p-4">Attempts / Reason</th>
                <th className="p-4">Logged Time</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-gray-400 font-bold">
                    Loading queue logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-gray-400 font-bold">
                    No WhatsApp logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/60 transition">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(log._id)}
                        onChange={() => handleSelectOne(log._id)}
                        className="accent-emerald-600 rounded cursor-pointer"
                      />
                    </td>

                    <td className="p-4">
                      <p className="font-mono font-black text-gray-900">{log.orderId}</p>
                      <span className="text-[10px] uppercase font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded">
                        {log.triggerType}
                      </span>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-gray-900">{log.recipientNumber}</p>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">
                        {log.recipientType}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                          log.status === "Sent"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : log.status === "Pending"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : log.status === "Failed"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-gray-100 text-gray-700 border-gray-300"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-gray-700">
                        {log.retries}/{log.maxRetries} Retries
                      </span>
                      {log.errorReason && (
                        <p className="text-[10px] text-rose-500 truncate max-w-xs">{log.errorReason}</p>
                      )}
                    </td>

                    <td className="p-4 font-mono text-[11px] text-gray-400">
                      {new Date(log.createdAt).toLocaleString("en-IN", {
                        dateStyle: "short",
                        timeStyle: "short"
                      })}
                    </td>

                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => setViewingMessage(log)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                        title="View Message"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {log.status !== "Sent" && (
                        <button
                          onClick={() => handleRetry(log._id)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-xl transition cursor-pointer"
                          title="Retry Now"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                      )}
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
            Total Logs: <strong className="text-gray-900">{totalEntries}</strong>
          </div>

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
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Message Viewer Modal */}
      {viewingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-hidden">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-black text-sm text-gray-900">
                  Message Content: <span className="font-mono text-emerald-600">{viewingMessage.recipientNumber}</span>
                </h3>
                <span className="text-[10px] text-gray-400">Order: {viewingMessage.orderId}</span>
              </div>
              <button
                onClick={() => setViewingMessage(null)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
              {viewingMessage.messageBody}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingMessage(null)}
                className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}