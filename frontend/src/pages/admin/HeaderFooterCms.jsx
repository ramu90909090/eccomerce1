import React, { useState, useEffect } from "react";
import {
  Save,
  Upload,
  Link as LinkIcon,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import API from "../../api/axios";
import { useSettings } from "../../context/SettingsContext";
import { getImageUrl } from "../../utils/productUtils";

export default function HeaderFooterCms() {
  const { settings, fetchSettings } = useSettings();
  const [formData, setFormData] = useState(null);
  const [activeTab, setActiveTab] = useState("navbar"); // "navbar" | "footer-brand" | "footer-trust" | "footer-info" | "footer-legal"
  const [navbarLogoFile, setNavbarLogoFile] = useState(null);
  const [footerLogoFile, setFooterLogoFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    if (settings) {
      setFormData(JSON.parse(JSON.stringify(settings)));
    }
  }, [settings]);

  if (!formData) {
    return <div className="p-8 text-center text-xs font-bold text-gray-400">Loading Configuration...</div>;
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg({ type: "", text: "" });

    try {
      const payload = new FormData();
      payload.append("settingsData", JSON.stringify(formData));

      if (navbarLogoFile) payload.append("navbarLogo", navbarLogoFile);
      if (footerLogoFile) payload.append("footerLogo", footerLogoFile);

      await API.put("/settings", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setStatusMsg({ type: "success", text: "Settings successfully updated and live on site!" });
      fetchSettings();
    } catch (err) {
      setStatusMsg({ type: "error", text: err.response?.data?.message || "Failed to update settings" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddQuickLink = () => {
    setFormData({
      ...formData,
      footer: {
        ...formData.footer,
        quickLinks: [...(formData.footer.quickLinks || []), { label: "New Link", url: "/" }]
      }
    });
  };

  const handleRemoveQuickLink = (index) => {
    setFormData({
      ...formData,
      footer: {
        ...formData.footer,
        quickLinks: formData.footer.quickLinks.filter((_, i) => i !== index)
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Header & Footer CMS Hub</h1>
          <p className="text-xs text-gray-500 mt-1">
            Realtime branding, logos, descriptions aur complete footer touchpoints ko manage karein.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-pink-500/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Saving..." : "Save All Changes"}</span>
        </button>
      </div>

      {statusMsg.text && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center space-x-2 ${
            statusMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-rose-50 border-rose-200 text-rose-700"
          }`}
        >
          {statusMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {[
          { id: "navbar", label: "Navbar Identity & Logo" },
          { id: "footer-brand", label: "Footer Brand & Description" },
          { id: "footer-trust", label: "Footer Trust Guarantees" },
          { id: "footer-info", label: "Customer Desk & Socials" },
          { id: "footer-legal", label: "Quick Links, Legal & Badges" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
              activeTab === tab.id
                ? "bg-pink-600 text-white shadow-md shadow-pink-500/20"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: NAVBAR */}
      {activeTab === "navbar" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-base font-black text-gray-900 border-b pb-3">Top Navbar Configuration</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
            <div>
              <label className="block text-gray-700 mb-1">Navbar Brand Name</label>
              <input
                type="text"
                value={formData.navbar?.brandName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, navbar: { ...formData.navbar, brandName: e.target.value } })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:border-pink-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Navbar Subtitle Tagline</label>
              <input
                type="text"
                value={formData.navbar?.brandSubtitle || ""}
                onChange={(e) =>
                  setFormData({ ...formData, navbar: { ...formData.navbar, brandSubtitle: e.target.value } })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:border-pink-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-gray-700">Navbar Brand Logo</label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                {navbarLogoFile ? (
                  <img src={URL.createObjectURL(navbarLogoFile)} alt="Preview" className="w-full h-full object-cover" />
                ) : formData.navbar?.logoUrl ? (
                  <img src={getImageUrl(formData.navbar.logoUrl)} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Sparkles className="w-6 h-6 text-pink-500" />
                )}
              </div>

              <div className="flex-1 w-full space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNavbarLogoFile(e.target.files[0])}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer"
                />
                <input
                  type="url"
                  placeholder="Or enter direct web logo URL..."
                  value={formData.navbar?.logoUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, navbar: { ...formData.navbar, logoUrl: e.target.value } })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs outline-none focus:border-pink-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FOOTER BRAND & DESCRIPTION (Requested Dynamic Section) */}
      {activeTab === "footer-brand" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-base font-black text-gray-900 border-b pb-3">Footer Brand, Logo & Description</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
            <div>
              <label className="block text-gray-700 mb-1">Footer Brand Name</label>
              <input
                type="text"
                placeholder="e.g. KHASTORE"
                value={formData.footer?.brandName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, footer: { ...formData.footer, brandName: e.target.value } })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:border-pink-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Footer Subtitle Tagline</label>
              <input
                type="text"
                placeholder="e.g. Premium Deals 2026"
                value={formData.footer?.brandSubtitle || ""}
                onChange={(e) =>
                  setFormData({ ...formData, footer: { ...formData.footer, brandSubtitle: e.target.value } })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:border-pink-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Footer Main Description Paragraph</label>
            <textarea
              rows={4}
              placeholder="e.g. Direct factory pricing aur authentic lifestyle & electronic gadgets..."
              value={formData.footer?.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, footer: { ...formData.footer, description: e.target.value } })
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:border-pink-500 outline-none text-xs leading-relaxed"
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-gray-700">Footer Brand Logo</label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-300 bg-slate-900 overflow-hidden flex items-center justify-center shrink-0">
                {footerLogoFile ? (
                  <img src={URL.createObjectURL(footerLogoFile)} alt="Preview" className="w-full h-full object-cover" />
                ) : formData.footer?.logoUrl ? (
                  <img src={getImageUrl(formData.footer.logoUrl)} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Sparkles className="w-6 h-6 text-pink-400" />
                )}
              </div>

              <div className="flex-1 w-full space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFooterLogoFile(e.target.files[0])}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer"
                />
                <input
                  type="url"
                  placeholder="Or enter direct web logo URL..."
                  value={formData.footer?.logoUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, footer: { ...formData.footer, logoUrl: e.target.value } })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs outline-none focus:border-pink-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FOOTER TRUST GUARENTEES */}
      {activeTab === "footer-trust" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-base font-black text-gray-900 border-b pb-3">Trust Badges (Top 4 Boxes Strip)</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(formData.footer?.trustGuarantees || []).map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3 text-xs">
                <span className="font-black text-pink-600 uppercase text-[10px]">Badge #{idx + 1}</span>
                <div>
                  <label className="block text-gray-600 font-bold mb-1">Headline</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...formData.footer.trustGuarantees];
                      updated[idx].title = e.target.value;
                      setFormData({ ...formData, footer: { ...formData.footer, trustGuarantees: updated } });
                    }}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-bold mb-1">Subtext</label>
                  <input
                    type="text"
                    value={item.subtitle}
                    onChange={(e) => {
                      const updated = [...formData.footer.trustGuarantees];
                      updated[idx].subtitle = e.target.value;
                      setFormData({ ...formData, footer: { ...formData.footer, trustGuarantees: updated } });
                    }}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-bold mb-1">Icon Shape</label>
                  <select
                    value={item.iconKey}
                    onChange={(e) => {
                      const updated = [...formData.footer.trustGuarantees];
                      updated[idx].iconKey = e.target.value;
                      setFormData({ ...formData, footer: { ...formData.footer, trustGuarantees: updated } });
                    }}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2 font-bold"
                  >
                    <option value="truck">Delivery Truck (Truck)</option>
                    <option value="shield">Warranty Shield (ShieldCheck)</option>
                    <option value="rotate">Return Policy (RotateCcw)</option>
                    <option value="headphones">Support Agent (Headphones)</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMER DESK & SOCIALS */}
      {activeTab === "footer-info" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-base font-black text-gray-900 border-b pb-3">Support Contacts & Social Profiles</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
            <div>
              <label className="block text-gray-700 mb-1">Office Address</label>
              <input
                type="text"
                value={formData.footer?.customerDesk?.address || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    footer: {
                      ...formData.footer,
                      customerDesk: { ...formData.footer.customerDesk, address: e.target.value }
                    }
                  })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Helpdesk Phone</label>
              <input
                type="text"
                value={formData.footer?.customerDesk?.phone || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    footer: {
                      ...formData.footer,
                      customerDesk: { ...formData.footer.customerDesk, phone: e.target.value }
                    }
                  })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Support Email</label>
              <input
                type="email"
                value={formData.footer?.customerDesk?.email || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    footer: {
                      ...formData.footer,
                      customerDesk: { ...formData.footer.customerDesk, email: e.target.value }
                    }
                  })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <h3 className="text-xs font-black uppercase text-gray-700 pt-3">Social Media URLs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-gray-500 font-bold mb-1">Instagram Link</label>
              <input
                type="url"
                value={formData.footer?.socialLinks?.instagram || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    footer: {
                      ...formData.footer,
                      socialLinks: { ...formData.footer.socialLinks, instagram: e.target.value }
                    }
                  })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block text-gray-500 font-bold mb-1">Twitter / X Link</label>
              <input
                type="url"
                value={formData.footer?.socialLinks?.twitter || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    footer: {
                      ...formData.footer,
                      socialLinks: { ...formData.footer.socialLinks, twitter: e.target.value }
                    }
                  })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block text-gray-500 font-bold mb-1">YouTube Link</label>
              <input
                type="url"
                value={formData.footer?.socialLinks?.youtube || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    footer: {
                      ...formData.footer,
                      socialLinks: { ...formData.footer.socialLinks, youtube: e.target.value }
                    }
                  })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: QUICK LINKS, LEGAL & BADGES */}
      {activeTab === "footer-legal" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-black text-gray-900">Footer Navigation Links</h2>
            <button
              onClick={handleAddQuickLink}
              type="button"
              className="inline-flex items-center space-x-1 text-xs font-bold text-pink-600 hover:text-pink-700 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Link</span>
            </button>
          </div>

          <div className="space-y-2">
            {(formData.footer?.quickLinks || []).map((link, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Link Title (e.g. Terms)"
                  value={link.label}
                  onChange={(e) => {
                    const updated = [...formData.footer.quickLinks];
                    updated[idx].label = e.target.value;
                    setFormData({ ...formData, footer: { ...formData.footer, quickLinks: updated } });
                  }}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold"
                />
                <input
                  type="text"
                  placeholder="Path URL (e.g. /terms)"
                  value={link.url}
                  onChange={(e) => {
                    const updated = [...formData.footer.quickLinks];
                    updated[idx].url = e.target.value;
                    setFormData({ ...formData, footer: { ...formData.footer, quickLinks: updated } });
                  }}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveQuickLink(idx)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <h3 className="text-xs font-black uppercase text-gray-700 pt-3 border-t">Copyright & Heart Notice</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
            <div>
              <label className="block text-gray-600 mb-1">Copyright Text</label>
              <input
                type="text"
                value={formData.footer?.copyrightText || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    footer: { ...formData.footer, copyrightText: e.target.value }
                  })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Crafted With Heart Text</label>
              <input
                type="text"
                value={formData.footer?.heartNotice || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    footer: { ...formData.footer, heartNotice: e.target.value }
                  })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}