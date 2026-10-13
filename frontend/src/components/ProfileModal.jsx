import React, { useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Compass,
  Edit3,
  CheckCircle2,
  Shield,
  Save,
  RotateCcw
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    mobile: user?.mobile || "",
    address: user?.address || "",
    pincode: user?.pincode || "",
    state: user?.state || "",
    district: user?.district || ""
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen || !user) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    try {
      if (updateProfile) {
        await updateProfile(formData);
      }
      setSuccessMsg("Details successfully update ho gayi!");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-2xl max-w-lg w-full overflow-hidden transition-all">
        
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl border border-white/30">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h3 className="text-lg font-black">{user.name}</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/25 px-2.5 py-0.5 rounded-full inline-flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Role: {user.role || "user"}</span>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/25 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-500">
              Account Credentials & Address
            </h4>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-xs font-bold text-pink-600 hover:text-violet-600 flex items-center space-x-1 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Details</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs font-bold text-gray-500 hover:text-gray-700 flex items-center space-x-1 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-3.5 text-xs">
            {/* Email (Read Only) */}
            <div>
              <label className="block font-bold text-gray-500 mb-1">Registered Email (Cannot be changed)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-xl font-semibold outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* Name & Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    name="name"
                    disabled={!isEditing}
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2.5 rounded-xl font-semibold border transition outline-none ${
                      isEditing
                        ? "bg-white border-pink-400 focus:ring-2 focus:ring-pink-500/20"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    name="mobile"
                    disabled={!isEditing}
                    value={formData.mobile}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2.5 rounded-xl font-semibold border transition outline-none ${
                      isEditing
                        ? "bg-white border-pink-400 focus:ring-2 focus:ring-pink-500/20"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">Delivery Address</label>
              <div className="relative">
                <Compass className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  name="address"
                  disabled={!isEditing}
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2.5 rounded-xl font-semibold border transition outline-none ${
                    isEditing
                      ? "bg-white border-pink-400 focus:ring-2 focus:ring-pink-500/20"
                      : "bg-gray-50 border-gray-200"
                  }`}
                />
              </div>
            </div>

            {/* State, District & Pincode */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">District</label>
                <input
                  type="text"
                  required
                  name="district"
                  disabled={!isEditing}
                  value={formData.district}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 rounded-xl font-semibold border transition outline-none ${
                    isEditing
                      ? "bg-white border-pink-400 focus:ring-2 focus:ring-pink-500/20"
                      : "bg-gray-50 border-gray-200"
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  required
                  name="state"
                  disabled={!isEditing}
                  value={formData.state}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 rounded-xl font-semibold border transition outline-none ${
                    isEditing
                      ? "bg-white border-pink-400 focus:ring-2 focus:ring-pink-500/20"
                      : "bg-gray-50 border-gray-200"
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  required
                  name="pincode"
                  disabled={!isEditing}
                  value={formData.pincode}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 rounded-xl font-semibold border transition outline-none ${
                    isEditing
                      ? "bg-white border-pink-400 focus:ring-2 focus:ring-pink-500/20"
                      : "bg-gray-50 border-gray-200"
                  }`}
                />
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-pink-500/25 active:scale-95 transition flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Updated Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}