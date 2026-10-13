import React, { useState, useEffect } from "react";
import {
  Save,
  Plus,
  Trash2,
  Edit,
  Layers,
  MapPin,
  HelpCircle,
  Phone,
  LayoutTemplate
} from "lucide-react";
import API from "../../api/axios";

export default function ContactPageCms() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("banner"); // 'banner' | 'cards' | 'map' | 'faqs'

  // Edit/Add Card Modal
  const [cardModal, setCardModal] = useState({ open: false, isEdit: false, data: {} });
  // Edit/Add FAQ Modal
  const [faqModal, setFaqModal] = useState({ open: false, isEdit: false, data: {} });

  const fetchConfig = async () => {
    try {
      const res = await API.get("/contact/config");
      if (res.data?.success) setConfig(res.data.data);
    } catch (err) {
      alert("Failed to load config");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Update General Configuration (Banner / Map)
  const handleSaveGeneral = async () => {
    try {
      const res = await API.put("/contact/config/general", {
        banner: config.banner,
        mapConfig: config.mapConfig,
        formConfig: config.formConfig
      });
      if (res.data?.success) alert("Configuration updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update configuration");
    }
  };

  // Card Operations
  const handleSaveCard = async (e) => {
    e.preventDefault();
    try {
      if (cardModal.isEdit) {
        await API.put(`/contact/config/cards/${cardModal.data._id}`, cardModal.data);
      } else {
        await API.post("/contact/config/cards", cardModal.data);
      }
      setCardModal({ open: false, isEdit: false, data: {} });
      fetchConfig();
    } catch (err) {
      alert("Error saving card");
    }
  };

  const handleDeleteCard = async (id) => {
    if (!window.confirm("Are you sure you want to delete this card?")) return;
    try {
      await API.delete(`/contact/config/cards/${id}`);
      fetchConfig();
    } catch (err) {
      alert("Delete failed");
    }
  };

  // FAQ Operations
  const handleSaveFaq = async (e) => {
    e.preventDefault();
    try {
      if (faqModal.isEdit) {
        await API.put(`/contact/config/faqs/${faqModal.data._id}`, faqModal.data);
      } else {
        await API.post("/contact/config/faqs", faqModal.data);
      }
      setFaqModal({ open: false, isEdit: false, data: {} });
      fetchConfig();
    } catch (err) {
      alert("Error saving FAQ");
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm("Delete this FAQ?")) return;
    try {
      await API.delete(`/contact/config/faqs/${id}`);
      fetchConfig();
    } catch (err) {
      alert("Delete failed");
    }
  };

  if (loading) return <div className="p-8 font-bold">Loading CMS Panel...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Contact Us Page CMS</h1>
          <p className="text-xs text-slate-500">Manage all visual elements, texts, cards & map settings.</p>
        </div>
        <button
          onClick={handleSaveGeneral}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1 shadow-md"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b">
        {[
          { id: "banner", label: "Header Banner", icon: LayoutTemplate },
          { id: "cards", label: "Contact Cards", icon: Phone },
          { id: "map", label: "Map & Form", icon: MapPin },
          { id: "faqs", label: "FAQ Manager", icon: HelpCircle }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                activeTab === tab.id
                  ? "border-pink-600 text-pink-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Banner Manager */}
      {activeTab === "banner" && (
        <div className="bg-white p-6 rounded-2xl border space-y-4 max-w-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">Banner Elements</h3>
            <label className="text-xs font-bold text-slate-600 flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.banner.isEnabled}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    banner: { ...config.banner, isEnabled: e.target.checked }
                  })
                }
              />
              <span>Enable Banner</span>
            </label>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tagline</label>
            <input
              type="text"
              value={config.banner.tagline}
              onChange={(e) =>
                setConfig({ ...config, banner: { ...config.banner, tagline: e.target.value } })
              }
              className="w-full text-xs p-2.5 border rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Heading</label>
            <input
              type="text"
              value={config.banner.heading}
              onChange={(e) =>
                setConfig({ ...config, banner: { ...config.banner, heading: e.target.value } })
              }
              className="w-full text-xs p-2.5 border rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={config.banner.description}
              onChange={(e) =>
                setConfig({ ...config, banner: { ...config.banner, description: e.target.value } })
              }
              className="w-full text-xs p-2.5 border rounded-xl"
            />
          </div>
        </div>
      )}

      {/* 2. Contact Cards Manager */}
      {activeTab === "cards" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-800">Cards Carousel ({config.carouselCards.length})</h3>
            <button
              onClick={() =>
                setCardModal({
                  open: true,
                  isEdit: false,
                  data: {
                    icon: "Phone",
                    title: "",
                    desc: "",
                    contact: "",
                    contactSub: "",
                    action: "",
                    btnText: "Call Now",
                    gradient: "from-blue-500 to-cyan-500"
                  }
                })
              }
              className="px-3 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Card</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {config.carouselCards.map((card) => (
              <div key={card._id} className="bg-white p-4 border rounded-2xl space-y-2 relative shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Icon: {card.icon}</span>
                <h4 className="font-bold text-sm text-slate-900">{card.title}</h4>
                <p className="text-xs text-slate-500">{card.desc}</p>
                <p className="text-xs font-black text-slate-800">{card.contact}</p>
                <div className="flex justify-end space-x-2 pt-2 border-t">
                  <button
                    onClick={() => setCardModal({ open: true, isEdit: true, data: { ...card } })}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCard(card._id)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Map & Form Manager */}
      {activeTab === "map" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border space-y-4">
            <h3 className="font-bold text-sm text-slate-800">Map Configuration</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location Title</label>
              <input
                type="text"
                value={config.mapConfig.locationTitle}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    mapConfig: { ...config.mapConfig, locationTitle: e.target.value }
                  })
                }
                className="w-full text-xs p-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Google Maps Embed URL</label>
              <textarea
                rows={3}
                value={config.mapConfig.embedUrl}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    mapConfig: { ...config.mapConfig, embedUrl: e.target.value }
                  })
                }
                className="w-full text-xs p-2.5 border rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Visiting Hours</label>
              <input
                type="text"
                value={config.mapConfig.visitingHours}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    mapConfig: { ...config.mapConfig, visitingHours: e.target.value }
                  })
                }
                className="w-full text-xs p-2.5 border rounded-xl"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border space-y-4">
            <h3 className="font-bold text-sm text-slate-800">Form Configuration</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Heading</label>
              <input
                type="text"
                value={config.formConfig.heading}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    formConfig: { ...config.formConfig, heading: e.target.value }
                  })
                }
                className="w-full text-xs p-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Badge Text</label>
              <input
                type="text"
                value={config.formConfig.badgeText}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    formConfig: { ...config.formConfig, badgeText: e.target.value }
                  })
                }
                className="w-full text-xs p-2.5 border rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. FAQs Manager */}
      {activeTab === "faqs" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-800">Frequently Asked Questions ({config.faqs.length})</h3>
            <button
              onClick={() =>
                setFaqModal({
                  open: true,
                  isEdit: false,
                  data: { question: "", answer: "" }
                })
              }
              className="px-3 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add FAQ</span>
            </button>
          </div>

          <div className="space-y-3">
            {config.faqs.map((faq) => (
              <div key={faq._id} className="bg-white p-4 border rounded-2xl flex justify-between items-start">
                <div className="space-y-1 pr-4">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">{faq.question}</h4>
                  <p className="text-xs text-slate-600">{faq.answer}</p>
                </div>
                <div className="flex space-x-2 shrink-0">
                  <button
                    onClick={() => setFaqModal({ open: true, isEdit: true, data: { ...faq } })}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteFaq(faq._id)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card Modal */}
      {cardModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSaveCard} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-3">
            <h3 className="font-bold text-sm">{cardModal.isEdit ? "Edit Card" : "New Card"}</h3>
            <input
              type="text"
              placeholder="Title"
              required
              value={cardModal.data.title}
              onChange={(e) =>
                setCardModal({ ...cardModal, data: { ...cardModal.data, title: e.target.value } })
              }
              className="w-full text-xs p-2.5 border rounded-xl"
            />
            <input
              type="text"
              placeholder="Description"
              required
              value={cardModal.data.desc}
              onChange={(e) =>
                setCardModal({ ...cardModal, data: { ...cardModal.data, desc: e.target.value } })
              }
              className="w-full text-xs p-2.5 border rounded-xl"
            />
            <input
              type="text"
              placeholder="Contact Display (e.g. +91 98765 43210)"
              required
              value={cardModal.data.contact}
              onChange={(e) =>
                setCardModal({ ...cardModal, data: { ...cardModal.data, contact: e.target.value } })
              }
              className="w-full text-xs p-2.5 border rounded-xl"
            />
            <input
              type="text"
              placeholder="Contact Subtext (e.g. Active 9 AM - 8 PM)"
              value={cardModal.data.contactSub}
              onChange={(e) =>
                setCardModal({ ...cardModal, data: { ...cardModal.data, contactSub: e.target.value } })
              }
              className="w-full text-xs p-2.5 border rounded-xl"
            />
            <input
              type="text"
              placeholder="Action Link (e.g. tel:+919876543210)"
              value={cardModal.data.action}
              onChange={(e) =>
                setCardModal({ ...cardModal, data: { ...cardModal.data, action: e.target.value } })
              }
              className="w-full text-xs p-2.5 border rounded-xl"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setCardModal({ open: false, isEdit: false, data: {} })}
                className="px-3 py-1.5 text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-pink-600 text-white rounded-xl text-xs font-bold"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FAQ Modal */}
      {faqModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSaveFaq} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-3">
            <h3 className="font-bold text-sm">{faqModal.isEdit ? "Edit FAQ" : "New FAQ"}</h3>
            <input
              type="text"
              placeholder="Question"
              required
              value={faqModal.data.question}
              onChange={(e) =>
                setFaqModal({ ...faqModal, data: { ...faqModal.data, question: e.target.value } })
              }
              className="w-full text-xs p-2.5 border rounded-xl"
            />
            <textarea
              rows={4}
              placeholder="Answer"
              required
              value={faqModal.data.answer}
              onChange={(e) =>
                setFaqModal({ ...faqModal, data: { ...faqModal.data, answer: e.target.value } })
              }
              className="w-full text-xs p-2.5 border rounded-xl"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setFaqModal({ open: false, isEdit: false, data: {} })}
                className="px-3 py-1.5 text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-pink-600 text-white rounded-xl text-xs font-bold"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}