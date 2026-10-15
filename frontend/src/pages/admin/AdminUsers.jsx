import React, { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  Edit2,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  X,
  Save,
  Users,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import API from "../../api/axios";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalCustomers: 0,
    verifiedCount: 0
  });

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [verifiedFilter, setVerifiedFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalError, setModalError] = useState("");

  const initialForm = {
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "user",
    isVerified: true,
    address: "",
    district: "",
    state: "Uttar Pradesh",
    pincode: ""
  };

  const [formData, setFormData] = useState(initialForm);

  // Fetch Users List
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        role: roleFilter,
        isVerified: verifiedFilter
      });

      const res = await API.get(`/users?${params.toString()}`);
      setUsers(res.data?.data || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
      setTotalEntries(res.data?.pagination?.total || 0);
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage, roleFilter, verifiedFilter]);

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialForm);
    setModalError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingId(user._id);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      password: "", // Khali rakhein agar password change na karna ho
      role: user.role || "user",
      isVerified: user.isVerified ?? true,
      address: user.address || "",
      district: user.district || user.city || "",
      state: user.state || "Uttar Pradesh",
      pincode: user.pincode || ""
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError("");

    try {
      if (editingId) {
        await API.put(`/users/${editingId}`, formData);
      } else {
        await API.post("/users", formData);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      setModalError(err.response?.data?.message || "Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Kya aap sach me is user account ko delete karna chahte hain?")) return;
    try {
      await API.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Metric KPI Cards */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">User Management & CRM</h1>
          <p className="text-xs text-gray-500 mt-1">
            Registered customers, roles, verification status aur shipping profiles ko control karein.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-pink-500 hover:opacity-95 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md shadow-pink-500/20 active:scale-95 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400">Total Users</span>
            <p className="text-lg font-black text-gray-900">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400">Verified Users</span>
            <p className="text-lg font-black text-emerald-600">{stats.verifiedCount}</p>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400">Customers</span>
            <p className="text-lg font-black text-pink-600">{stats.totalCustomers}</p>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400">Admins</span>
            <p className="text-lg font-black text-amber-600">{stats.totalAdmins}</p>
          </div>
        </div>
      </div>

      {/* 2. Controls: Search, Filters & Pagination Dropdown */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search Name, Email, Mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 py-2.5 px-3 rounded-2xl font-bold text-gray-700 outline-none cursor-pointer"
          >
            <option value="All">All Roles</option>
            <option value="user">Customer (User)</option>
            <option value="admin">Super Admin</option>
          </select>

          {/* Verification Status Filter */}
          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 py-2.5 px-3 rounded-2xl font-bold text-gray-700 outline-none cursor-pointer"
          >
            <option value="All">All Verification</option>
            <option value="true">Verified (OTP Done)</option>
            <option value="false">Unverified</option>
          </select>
        </div>

        {/* Page Limit Selector */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <span className="font-bold text-gray-500">Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="bg-gray-50 border border-gray-200 py-2 px-3 rounded-xl font-black text-gray-900 outline-none cursor-pointer"
          >
            <option value={10}>10 Users</option>
            <option value={25}>25 Users</option>
            <option value={50}>50 Users</option>
            <option value={100}>100 Users</option>
          </select>
        </div>
      </div>

      {/* 3. Users Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 uppercase text-gray-500 font-bold">
              <tr>
                <th className="p-4">User Identity</th>
                <th className="p-4">Mobile & Address</th>
                <th className="p-4">Account Role</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-gray-400 font-bold">
                    Loading users list...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-gray-400 font-bold">
                    Koi user nahi mila.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/60 transition">
                    <td className="p-4 flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                        {u.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-gray-900 truncate">{u.name}</p>
                        <p className="text-[11px] text-gray-400 truncate flex items-center space-x-1">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span>{u.email}</span>
                        </p>
                      </div>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-gray-800 flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span>{u.mobile || "N/A"}</span>
                      </p>
                      <p className="text-[10px] text-gray-400 truncate max-w-xs flex items-center space-x-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span>{u.district || u.city || "No District"}, {u.pincode}</span>
                      </p>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                          u.role === "admin"
                            ? "bg-violet-50 text-violet-700 border-violet-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        <span>{u.role || "user"}</span>
                      </span>
                    </td>

                    <td className="p-4">
                      {u.isVerified ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <UserCheck className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <UserX className="w-3 h-3" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-mono text-[11px] text-gray-500">
                      {new Date(u.createdAt || Date.now()).toLocaleDateString("en-IN", {
                        dateStyle: "medium"
                      })}
                    </td>

                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-2 text-violet-600 hover:bg-violet-50 rounded-xl transition cursor-pointer"
                        title="Edit User"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                        title="Delete User"
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

        {/* 4. Pagination Footer */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-gray-500">
          <div>
            Total Records: <strong className="text-gray-900">{totalEntries}</strong>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
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

      {/* 5. Create / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-hidden">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 border border-gray-100 my-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4.5 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
              <div>
                <h3 className="font-black text-lg text-gray-900">
                  {editingId ? "Edit User Account" : "Add New User Account"}
                </h3>
                <p className="text-xs text-gray-400">User credentials, access role aur delivery address set karein</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Form */}
            <form id="userForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">Full Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Email Address *</label>
                  <input
                    required
                    type="email"
                    disabled={!!editingId} // Edit ke waqt email lock rahega
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:border-pink-500 ${
                      editingId ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-gray-50"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">
                    {editingId ? "Reset Password (Leave blank to keep same)" : "Password *"}
                  </label>
                  <input
                    type="password"
                    required={!editingId}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">Account Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-pink-500 font-bold"
                  >
                    <option value="user">Customer (User)</option>
                    <option value="admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">OTP Verification Status</label>
                  <select
                    value={String(formData.isVerified)}
                    onChange={(e) => setFormData({ ...formData, isVerified: e.target.value === "true" })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-pink-500 font-bold"
                  >
                    <option value="true">Verified Account</option>
                    <option value="false">Unverified Account</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="Flat no., Street, Area"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">District / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Lucknow"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="226001"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-pink-500"
                  />
                </div>
              </div>
            </form>

            {/* Sticky Actions Footer */}
            <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-gray-100 flex justify-end space-x-2 rounded-b-3xl">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="userForm"
                disabled={isSubmitting}
                className="px-5 py-2 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold rounded-xl text-xs shadow-md hover:opacity-95 disabled:opacity-50 transition cursor-pointer"
              >
                {isSubmitting ? "Saving..." : editingId ? "Update User" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}