import React, { useState, useEffect } from "react";
import {
  Save,
  Plus,
  Trash2,
  Edit3,
  Layers,
  Image,
  CheckCircle,
  XCircle,
  Award,
  Sparkles,
  Store,
  Users,
  Eye,
  Check
} from "lucide-react";
import API from "../../api/axios";

export default function AboutPageCms() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("hero");

  // Modals
  const [statModal, setStatModal] = useState({ open: false, isEdit: false, data: {} });
  const [infraModal, setInfraModal] = useState({ open: false, isEdit: false, data: {} });
  const [pillarModal, setPillarModal] = useState({ open: false, isEdit: false, data: {} });
  const [milestoneModal, setMilestoneModal] = useState({ open: false, isEdit: false, data: {} });
  const [newImageUrl, setNewImageUrl] = useState("");

  const fetchConfig = async () => {
    try {
      const res = await API.get("/about/config");
      if (res.data?.success) setConfig(res.data.data);
    } catch (err) {
      alert("Failed to load About Us CMS data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveGeneral = async () => {
    try {
      await API.put("/about/config/general", {
        hero: config.hero,
        founder: config.founder,
        cta: config.cta
      });
      alert("Sections updated successfully!");
    } catch (err) {
      alert("Failed to save changes");
    }
  };

  // Stats
  const handleSaveStat = async (e) => {
    e.preventDefault();
    try {
      if (statModal.isEdit) {
        await API.put(`/about/config/stats/${statModal.data._id}`, statModal.data);
      } else {
        await API.post("/about/config/stats", statModal.data);
      }
      setStatModal({ open: false, isEdit: false, data: {} });
      fetchConfig();
    } catch (err) {
      alert("Error saving stat");
    }
  };

  const handleDeleteStat = async (id) => {
    if (!window.confirm("Delete this stat?")) return;
    await API.delete(`/about/config/stats/${id}`);
    fetchConfig();
  };

  // Infrastructure item & multi images
  const handleSaveInfra = async (e) => {
    e.preventDefault();
    try {
      if (infraModal.isEdit) {
        await API.put(`/about/config/infrastructure/${infraModal.data._id}`, infraModal.data);
      } else {
        await API.post("/about/config/infrastructure", infraModal.data);
      }
      setInfraModal({ open: false, isEdit: false, data: {} });
      fetchConfig();
    } catch (err) {
      alert("Error saving infrastructure item");
    }
  };

  const handleDeleteInfra = async (id) => {
    if (!window.confirm("Delete this infrastructure card?")) return;
    await API.delete(`/about/config/infrastructure/${id}`);
    fetchConfig();
  };

  // Toggle image active state directly
  const handleToggleInfraImage = async (infraId, imgIdx) => {
    try {
      await API.patch(`/about/config/infrastructure/${infraId}/images/${imgIdx}/toggle`);
      fetchConfig();
    } catch (err) {
      alert("Failed to toggle image status");
    }
  };

  const handleAddImageToInfra = (infraId) => {
    if (!newImageUrl.trim()) return alert("Enter image URL");
    const updatedInfra = config.infrastructure.map((item) => {
      if (item._id === infraId) {
        return {
          ...item,
          images: [...(item.images || []), { url: newImageUrl, isActive: true, caption: "New Image" }]
        };
      }
      return item;
    });

    const target = updatedInfra.find((i) => i._id === infraId);
    API.put(`/about/config/infrastructure/${infraId}`, target).then(() => {
      setNewImageUrl("");
      fetchConfig();
    });
  };

  // Pillars
  const handleSavePillar = async (e) => {
    e.preventDefault();
    try {
      if (pillarModal.isEdit) {
        await API.put(`/about/config/pillars/${pillarModal.data._id}`, pillarModal.data);
      } else {
        await API.post("/about/config/pillars", pillarModal.data);
      }
      setPillarModal({ open: false, isEdit: false, data: {} });
      fetchConfig();
    } catch (err) {
      alert("Error saving pillar");
    }
  };

  const handleDeletePillar = async (id) => {
    if (!window.confirm("Delete pillar?")) return;
    await API.delete(`/about/config/pillars/${id}`);
    fetchConfig();
  };

  // Milestones
  const handleSaveMilestone = async (e) => {
    e.preventDefault();
    try {
      if (milestoneModal.isEdit) {
        await API.put(`/about/config/milestones/${milestoneModal.data._id}`, milestoneModal.data);
      } else {
        await API.post("/about/config/milestones", milestoneModal.data);
      }
      setMilestoneModal({ open: false, isEdit: false, data: {} });
      fetchConfig();
    } catch (err) {
      alert("Error saving milestone");
    }
  };

  const handleDeleteMilestone = async (id) => {
    if (!window.confirm("Delete milestone?")) return;
    await API.delete(`/about/config/milestones/${id}`);
    fetchConfig();
  };

  if (loading) return <div className="p-8 font-bold">Loading About Us CMS...</div>;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-black text-slate-800">About Us Page CMS</h1>
          <p className="text-xs text-slate-500">
            Control hero showcase, live counter digits, warehouse galleries & founder profile.
          </p>
        </div>
        <button
          onClick={handleSaveGeneral}
          className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-extrabold rounded-2xl text-xs flex items-center space-x-2 shadow-lg shadow-pink-500/20 active:scale-95 transition"
        >
          <Save className="w-4 h-4" />
          <span>Save Active Changes</span>
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        {[
          { id: "hero", label: "Hero Banner" },
          { id: "stats", label: "Stats Counter" },
          { id: "infra", label: "Infrastructure & Photos" },
          { id: "founder", label: "Founder & Leadership" },
          { id: "pillars", label: "Core Pillars" },
          { id: "milestones", label: "Milestones Timeline" },
          { id: "cta", label: "Call To Action" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === tab.id
                ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. HERO TAB */}
      {activeTab === "hero" && (
        <div className="bg-white p-6 rounded-3xl border space-y-4 max-w-2xl">
          <h3 className="font-black text-sm text-slate-800">Hero Section Content</h3>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Badge Text</label>
            <input
              type="text"
              value={config.hero.badge}
              onChange={(e) => setConfig({ ...config, hero: { ...config.hero, badge: e.target.value } })}
              className="w-full text-xs p-3 border rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Heading Prefix</label>
              <input
                type="text"
                value={config.hero.headingPrefix}
                onChange={(e) =>
                  setConfig({ ...config, hero: { ...config.hero, headingPrefix: e.target.value } })
                }
                className="w-full text-xs p-3 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gradient Highlight</label>
              <input
                type="text"
                value={config.hero.headingHighlight}
                onChange={(e) =>
                  setConfig({ ...config, hero: { ...config.hero, headingHighlight: e.target.value } })
                }
                className="w-full text-xs p-3 border rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Hero Description</label>
            <textarea
              rows={4}
              value={config.hero.description}
              onChange={(e) =>
                setConfig({ ...config, hero: { ...config.hero, description: e.target.value } })
              }
              className="w-full text-xs p-3 border rounded-xl"
            />
          </div>
        </div>
      )}

      {/* 2. STATS COUNTER TAB */}
      {activeTab === "stats" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-sm text-slate-800">Animated Stats Counter ({config.stats.length})</h3>
            <button
              onClick={() =>
                setStatModal({
                  open: true,
                  isEdit: false,
                  data: { number: 100, suffix: "+", label: "", change: "", isDecimal: false }
                })
              }
              className="px-3.5 py-2 bg-violet-600 text-white font-bold rounded-xl text-xs flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" /> <span>Add New Stat</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {config.stats.map((st) => (
              <div key={st._id} className="bg-white p-5 rounded-2xl border space-y-2 shadow-sm">
                <span className="text-2xl font-black text-slate-900">
                  {st.prefix}
                  {st.number}
                  {st.suffix}
                </span>
                <p className="text-xs font-bold text-slate-700">{st.label}</p>
                <p className="text-[11px] font-semibold text-pink-600">{st.change}</p>
                <div className="flex justify-end space-x-2 pt-2 border-t">
                  <button
                    onClick={() => setStatModal({ open: true, isEdit: true, data: { ...st } })}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteStat(st._id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. INFRASTRUCTURE & MULTI-IMAGE MANAGEMENT */}
      {activeTab === "infra" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-sm text-slate-800">
              Infrastructure Gallery ({config.infrastructure.length})
            </h3>
            <button
              onClick={() =>
                setInfraModal({
                  open: true,
                  isEdit: false,
                  data: {
                    tag: "Logistics Hub",
                    title: "",
                    desc: "",
                    icon: "Store",
                    images: []
                  }
                })
              }
              className="px-3.5 py-2 bg-violet-600 text-white font-bold rounded-xl text-xs flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" /> <span>Add Infrastructure Card</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {config.infrastructure.map((item) => (
              <div key={item._id} className="bg-white rounded-3xl border p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full">
                      {item.tag}
                    </span>
                    <h4 className="font-black text-base text-slate-900 mt-1">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setInfraModal({ open: true, isEdit: true, data: { ...item } })}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteInfra(item._id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Multiple Images Sub-manager */}
                <div className="space-y-2 border-t pt-3">
                  <p className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Uploaded Images ({item.images?.length || 0})</span>
                    <span className="text-[10px] text-slate-400">Green = Live on Page</span>
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {item.images?.map((img, imgIdx) => (
                      <div
                        key={imgIdx}
                        className={`relative rounded-xl overflow-hidden border-2 h-24 group ${
                          img.isActive ? "border-emerald-500 shadow-sm" : "border-slate-200 opacity-60"
                        }`}
                      >
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleToggleInfraImage(item._id, imgIdx)}
                          className={`absolute bottom-1 right-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-md flex items-center space-x-1 ${
                            img.isActive ? "bg-emerald-600" : "bg-slate-700"
                          }`}
                        >
                          {img.isActive ? <Check className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{img.isActive ? "Active" : "Hidden"}</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Image URL to this item */}
                  <div className="flex space-x-2 pt-2">
                    <input
                      type="url"
                      placeholder="Add image URL..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 text-[11px] p-2 border rounded-xl outline-none"
                    />
                    <button
                      onClick={() => handleAddImageToInfra(item._id)}
                      className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-pink-600 transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. FOUNDER TAB */}
      {activeTab === "founder" && (
        <div className="bg-white p-6 rounded-3xl border space-y-4 max-w-2xl">
          <h3 className="font-black text-sm text-slate-800">Founder & CEO Showcase</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Founder Name</label>
              <input
                type="text"
                value={config.founder.name}
                onChange={(e) =>
                  setConfig({ ...config, founder: { ...config.founder, name: e.target.value } })
                }
                className="w-full text-xs p-3 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                value={config.founder.designation}
                onChange={(e) =>
                  setConfig({ ...config, founder: { ...config.founder, designation: e.target.value } })
                }
                className="w-full text-xs p-3 border rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Featured Quote</label>
            <input
              type="text"
              value={config.founder.quote}
              onChange={(e) =>
                setConfig({ ...config, founder: { ...config.founder, quote: e.target.value } })
              }
              className="w-full text-xs p-3 border rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Vision Story</label>
            <textarea
              rows={4}
              value={config.founder.visionStory}
              onChange={(e) =>
                setConfig({ ...config, founder: { ...config.founder, visionStory: e.target.value } })
              }
              className="w-full text-xs p-3 border rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Founder Photo URL</label>
            <input
              type="url"
              value={config.founder.images?.[0]?.url || ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  founder: {
                    ...config.founder,
                    images: [{ url: e.target.value, isActive: true }]
                  }
                })
              }
              className="w-full text-xs p-3 border rounded-xl"
            />
          </div>
        </div>
      )}

      {/* 5. PILLARS TAB */}
      {activeTab === "pillars" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-sm text-slate-800">Operational Pillars ({config.pillars.length})</h3>
            <button
              onClick={() =>
                setPillarModal({
                  open: true,
                  isEdit: false,
                  data: {
                    icon: "ShieldCheck",
                    title: "",
                    desc: "",
                    color: "from-blue-500 to-cyan-500"
                  }
                })
              }
              className="px-3.5 py-2 bg-violet-600 text-white font-bold rounded-xl text-xs flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" /> <span>Add Pillar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {config.pillars.map((p) => (
              <div key={p._id} className="bg-white p-5 rounded-3xl border space-y-3 shadow-sm">
                <span className="text-xs font-bold text-slate-400">Icon: {p.icon}</span>
                <h4 className="font-black text-sm text-slate-900">{p.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
                <div className="flex justify-end space-x-2 pt-2 border-t">
                  <button
                    onClick={() => setPillarModal({ open: true, isEdit: true, data: { ...p } })}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePillar(p._id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. MILESTONES TAB */}
      {activeTab === "milestones" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-sm text-slate-800">Evolution Milestones ({config.milestones.length})</h3>
            <button
              onClick={() =>
                setMilestoneModal({
                  open: true,
                  isEdit: false,
                  data: { year: "2026", title: "", desc: "" }
                })
              }
              className="px-3.5 py-2 bg-violet-600 text-white font-bold rounded-xl text-xs flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" /> <span>Add Milestone</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {config.milestones.map((m) => (
              <div key={m._id} className="bg-white p-5 rounded-2xl border space-y-2 shadow-sm">
                <span className="text-xl font-black text-pink-600">{m.year}</span>
                <h4 className="font-bold text-sm text-slate-900">{m.title}</h4>
                <p className="text-xs text-slate-500">{m.desc}</p>
                <div className="flex justify-end space-x-2 pt-2 border-t">
                  <button
                    onClick={() => setMilestoneModal({ open: true, isEdit: true, data: { ...m } })}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMilestone(m._id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. CTA TAB */}
      {activeTab === "cta" && (
        <div className="bg-white p-6 rounded-3xl border space-y-4 max-w-xl">
          <h3 className="font-black text-sm text-slate-800">Call to Action Footer</h3>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Heading</label>
            <input
              type="text"
              value={config.cta.heading}
              onChange={(e) => setConfig({ ...config, cta: { ...config.cta, heading: e.target.value } })}
              className="w-full text-xs p-3 border rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={config.cta.description}
              onChange={(e) =>
                setConfig({ ...config, cta: { ...config.cta, description: e.target.value } })
              }
              className="w-full text-xs p-3 border rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Button Text</label>
              <input
                type="text"
                value={config.cta.buttonText}
                onChange={(e) =>
                  setConfig({ ...config, cta: { ...config.cta, buttonText: e.target.value } })
                }
                className="w-full text-xs p-3 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Button Link</label>
              <input
                type="text"
                value={config.cta.buttonLink}
                onChange={(e) =>
                  setConfig({ ...config, cta: { ...config.cta, buttonLink: e.target.value } })
                }
                className="w-full text-xs p-3 border rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal: Stat */}
      {statModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSaveStat} className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-3">
            <h3 className="font-black text-sm">{statModal.isEdit ? "Edit Stat" : "New Stat"}</h3>
            <input
              type="number"
              placeholder="Target Number (e.g. 75000)"
              required
              value={statModal.data.number || ""}
              onChange={(e) =>
                setStatModal({ ...statModal, data: { ...statModal.data, number: Number(e.target.value) } })
              }
              className="w-full text-xs p-2.5 border rounded-xl"
            />
            <input
              type="text"
              placeholder="Suffix (e.g. + or ★)"
              value={statModal.data.suffix || ""}
              onChange={(e) =>
                setStatModal({ ...statModal, data: { ...statModal.data, suffix: e.target.value } })
              }
              className="w-full text-xs p-2.5 border rounded-xl"
            />
            <input
              type="text"
              placeholder="Label (e.g. Delivered Orders)"
              required
              value={statModal.data.label || ""}
              onChange={(e) =>
                setStatModal({ ...statModal, data: { ...statModal.data, label: e.target.value } })
              }
              className="w-full text-xs p-2.5 border rounded-xl"
            />
            <input
              type="text"
              placeholder="Highlight (e.g. Pan-India Reach)"
              value={statModal.data.change || ""}
              onChange={(e) =>
                setStatModal({ ...statModal, data: { ...statModal.data, change: e.target.value } })
              }
              className="w-full text-xs p-2.5 border rounded-xl"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setStatModal({ open: false, isEdit: false, data: {} })}
                className="px-3 py-1.5 text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-bold">
                Save Stat
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Infrastructure */}
      {infraModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSaveInfra} className="bg-white rounded-2xl max-w-md w-full p-5 space-y-3">
            <h3 className="font-black text-sm">
              {infraModal.isEdit ? "Edit Infrastructure Card" : "New Infrastructure Card"}
            </h3>
            <input
              type="text"
              placeholder="Tag (e.g. Flagship Store)"
              required
              value={infraModal.data.tag || ""}
              onChange={(e) =>
                setInfraModal({ ...infraModal, data: { ...infraModal.data, tag: e.target.value } })
              }
              className="w-full text-xs p-2.5 border rounded-xl"
            />
            <input
              type="text"
              placeholder="Title"
              required
              value={infraModal.data.title || ""}
              onChange={(e) =>
                setInfraModal({ ...infraModal, data: { ...infraModal.data, title: e.target.value } })
              }
              className="w-full text-xs p-2.5 border rounded-xl"
            />
            <textarea
              rows={3}
              placeholder="Description"
              required
              value={infraModal.data.desc || ""}
              onChange={(e) =>
                setInfraModal({ ...infraModal, data: { ...infraModal.data, desc: e.target.value } })
              }
              className="w-full text-xs p-2.5 border rounded-xl"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setInfraModal({ open: false, isEdit: false, data: {} })}
                className="px-3 py-1.5 text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-bold">
                Save Card
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Pillar */}
      {pillarModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSavePillar} className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-3">
            <h3 className="font-black text-sm">{pillarModal.isEdit ? "Edit Pillar" : "New Pillar"}</h3>
            <input
              type="text"
              placeholder="Title"
              required
              value={pillarModal.data.title || ""}
              onChange={(e) =>
                setPillarModal({ ...pillarModal, data: { ...pillarModal.data, title: e.target.value } })
              }
              className="w-full text-xs p-2.5 border rounded-xl"
            />
            <textarea
              rows={3}
              placeholder="Description"
              required
              value={pillarModal.data.desc || ""}
              onChange={(e) =>
                setPillarModal({ ...pillarModal, data: { ...pillarModal.data, desc: e.target.value } })
              }
              className="w-full text-xs p-2.5 border rounded-xl"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setPillarModal({ open: false, isEdit: false, data: {} })}
                className="px-3 py-1.5 text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-bold">
                Save Pillar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Milestone */}
      {milestoneModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSaveMilestone} className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-3">
            <h3 className="font-black text-sm">{milestoneModal.isEdit ? "Edit Milestone" : "New Milestone"}</h3>
            <input
              type="text"
              placeholder="Year (e.g. 2026)"
              required
              value={milestoneModal.data.year || ""}
              onChange={(e) =>
                setMilestoneModal({ ...milestoneModal, data: { ...milestoneModal.data, year: e.target.value } })
              }
              className="w-full text-xs p-2.5 border rounded-xl"
            />
            <input
              type="text"
              placeholder="Title"
              required
              value={milestoneModal.data.title || ""}
              onChange={(e) =>
                setMilestoneModal({ ...milestoneModal, data: { ...milestoneModal.data, title: e.target.value } })
              }
              className="w-full text-xs p-2.5 border rounded-xl"
            />
            <textarea
              rows={3}
              placeholder="Description"
              required
              value={milestoneModal.data.desc || ""}
              onChange={(e) =>
                setMilestoneModal({ ...milestoneModal, data: { ...milestoneModal.data, desc: e.target.value } })
              }
              className="w-full text-xs p-2.5 border rounded-xl"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setMilestoneModal({ open: false, isEdit: false, data: {} })}
                className="px-3 py-1.5 text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-bold">
                Save Milestone
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}