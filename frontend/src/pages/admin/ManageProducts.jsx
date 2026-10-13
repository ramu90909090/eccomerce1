import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Upload,
  Link as LinkIcon,
  X,
  Star,
  AlertCircle,
  Layers,
  ChevronLeft,
  ChevronRight,
  Package,
  AlertTriangle,
  CheckCircle,
  Filter,
  Boxes,
  ArrowUpDown
} from "lucide-react";
import API from "../../api/axios";
import { calculateFinalPrice, getImageUrl } from "../../utils/productUtils";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Pagination States
  const [itemsPerPage, setItemsPerPage] = useState(10); // 10 | 25 | 50 | 100
  const [currentPage, setCurrentPage] = useState(1);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const initialForm = {
    name: "",
    category: "Electronics",
    price: "",
    discount: 0,
    stock: 20, // Stock quantity field
    rating: 4.5,
    isTrending: false,
    isRecent: true,
    description: "",
    uploadMode: "file",
    urlInput: ""
  };

  const [formData, setFormData] = useState(initialForm);
  const [imageSlots, setImageSlots] = useState([]);

  // Fetch all products (backend returns sorted by latest first)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/products");
      // Default to latest first if not sorted
      const list = (res.data?.data || []).sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      setProducts(list);
    } catch (err) {
      console.error("Fetch products failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products by Search & Category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory =
        selectedCategory === "All" || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Reset to page 1 whenever search, category or itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, itemsPerPage]);

  // Pagination Slicing
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Inventory KPI Totals
  const inventoryStats = useMemo(() => {
    let inStock = 0;
    let moderate = 0;
    let lowStock = 0;

    products.forEach((p) => {
      const q = p.stock !== undefined ? Number(p.stock) : 10;
      if (q <= 5) lowStock++;
      else if (q <= 10) moderate++;
      else inStock++;
    });

    return { total: products.length, inStock, moderate, lowStock };
  }, [products]);

  // Stock Badge Render Helper
  const renderStockBadge = (stock) => {
    const qty = stock !== undefined ? Number(stock) : 0;

    if (qty <= 5) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-50 text-rose-600 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span>{qty} left (Critical)</span>
        </span>
      );
    }
    if (qty <= 10) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>{qty} left (Low)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>{qty} (In Stock)</span>
      </span>
    );
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialForm);
    setImageSlots([]);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingId(prod._id);
    setFormData({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      discount: prod.discount,
      stock: prod.stock !== undefined ? prod.stock : 10,
      rating: prod.rating,
      isTrending: prod.isTrending,
      isRecent: prod.isRecent,
      description: prod.description,
      uploadMode: "file",
      urlInput: ""
    });

    const existing = (prod.images || [prod.image]).filter(Boolean).map((img) => ({
      type: "url",
      data: img,
      previewUrl: getImageUrl(img)
    }));

    setImageSlots(existing);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleFilesSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (imageSlots.length + files.length > 5) {
      setErrorMsg("Maximum 5 images allowed hain.");
      return;
    }

    const newSlots = files.map((file) => ({
      type: "file",
      data: file,
      previewUrl: URL.createObjectURL(file)
    }));

    setImageSlots((prev) => [...prev, ...newSlots]);
    setErrorMsg("");
    e.target.value = "";
  };

  const handleAddUrl = () => {
    if (!formData.urlInput.trim()) return;

    if (imageSlots.length >= 5) {
      setErrorMsg("Maximum 5 images allowed hain.");
      return;
    }

    setImageSlots((prev) => [
      ...prev,
      {
        type: "url",
        data: formData.urlInput.trim(),
        previewUrl: formData.urlInput.trim()
      }
    ]);

    setFormData((prev) => ({ ...prev, urlInput: "" }));
    setErrorMsg("");
  };

  const handleRemoveSlot = (index) => {
    setImageSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageSlots.length < 3) {
      setErrorMsg("Kam se kam 3 images add karna anivarya hai (Minimum 3, Maximum 5).");
      return;
    }
    if (imageSlots.length > 5) {
      setErrorMsg("Maximum 5 images se zyada add nahi kar sakte.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("category", formData.category);
      payload.append("price", formData.price);
      payload.append("discount", formData.discount);
      payload.append("stock", formData.stock);
      payload.append("rating", formData.rating);
      payload.append("isTrending", formData.isTrending);
      payload.append("isRecent", formData.isRecent);
      payload.append("description", formData.description);

      const urls = [];
      imageSlots.forEach((slot) => {
        if (slot.type === "file") {
          payload.append("imageFiles", slot.data);
        } else {
          urls.push(slot.data);
        }
      });

      if (editingId) {
        payload.append("keptImages", JSON.stringify(urls));
        await API.put(`/products/${editingId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        payload.append("existingUrls", JSON.stringify(urls));
        await API.post("/products", payload, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await API.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Inventory KPIs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Manage Store Products</h1>
          <p className="text-xs text-gray-500 mt-1">
            Realtime inventory telemetry, stock quantity warnings & multi-image manager.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-pink-500 hover:opacity-95 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md shadow-pink-500/20 active:scale-95 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* KPI Cards: Inventory Status */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400">Total Products</span>
            <p className="text-lg font-black text-gray-900">{inventoryStats.total}</p>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400">&gt; 10 in Stock</span>
            <p className="text-lg font-black text-emerald-600">{inventoryStats.inStock}</p>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400">6–10 Items (Moderate)</span>
            <p className="text-lg font-black text-amber-600">{inventoryStats.moderate}</p>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400">&le; 5 Left (Critical)</span>
            <p className="text-lg font-black text-rose-600">{inventoryStats.lowStock}</p>
          </div>
        </div>
      </div>

      {/* 2. Controls Toolbar: Search, Category Filter & Items Per Page Selector */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-50 border border-gray-200 py-2.5 px-3 rounded-2xl font-bold text-gray-700 outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Footwear">Footwear</option>
              <option value="Home">Home</option>
            </select>
          </div>
        </div>

        {/* Items Per Page Selector (10, 25, 50, 100) */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <span className="font-bold text-gray-500">Show per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="bg-gray-50 border border-gray-200 py-2 px-3 rounded-xl font-black text-gray-900 outline-none focus:ring-2 focus:ring-pink-500/20 cursor-pointer"
          >
            <option value={10}>10 Items</option>
            <option value={25}>25 Items</option>
            <option value={50}>50 Items</option>
            <option value={100}>100 Items</option>
          </select>
        </div>
      </div>

      {/* 3. Products Data Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 uppercase text-gray-500 font-bold">
              <tr>
                <th className="p-4">Item & Images</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Remaining Stock</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Badges</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-gray-400 font-bold">
                    Loading inventory records...
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-gray-400 font-bold">
                    No products matched your criteria.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((prod) => {
                  const thumbs =
                    prod.images && prod.images.length > 0
                      ? prod.images
                      : [prod.image];

                  return (
                    <tr key={prod._id} className="hover:bg-gray-50/60 transition">
                      {/* Product Thumbnail & Title */}
                      <td className="p-4 flex items-center space-x-3">
                        <div className="relative shrink-0">
                          <img
                            src={getImageUrl(thumbs[0])}
                            alt={prod.name}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                          />
                          <span className="absolute -bottom-1 -right-1 bg-gray-900 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                            {thumbs.length}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate max-w-xs">{prod.name}</p>
                          <span className="text-[10px] text-gray-400 font-mono">
                            Added: {new Date(prod.createdAt || Date.now()).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg font-bold text-[11px]">
                          {prod.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="p-4 font-bold">
                        <div>₹{calculateFinalPrice(prod.price, prod.discount).toLocaleString()}</div>
                        {prod.discount > 0 && (
                          <div className="text-[10px] text-gray-400 line-through">₹{prod.price}</div>
                        )}
                      </td>

                      {/* Color-Coded Stock Status Column */}
                      <td className="p-4">
                        {renderStockBadge(prod.stock)}
                      </td>

                      {/* Rating */}
                      <td className="p-4">
                        <div className="flex items-center space-x-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{prod.rating}</span>
                        </div>
                      </td>

                      {/* Badges */}
                      <td className="p-4 space-x-1">
                        {prod.isTrending && (
                          <span className="bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            Trending
                          </span>
                        )}
                        {prod.isRecent && (
                          <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            New
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-2 text-violet-600 hover:bg-violet-50 rounded-xl transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod._id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Complete Pagination Footer Bar */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-gray-500">
          <div>
            Showing <strong className="text-gray-900">{totalItems === 0 ? 0 : startIndex + 1}</strong> to{" "}
            <strong className="text-gray-900">
              {Math.min(startIndex + itemsPerPage, totalItems)}
            </strong>{" "}
            of <strong className="text-gray-900">{totalItems}</strong> entries
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Number Chips */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((page, idx, arr) => (
                  <React.Fragment key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                      <span className="px-1 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-xl font-black transition cursor-pointer ${
                        currentPage === page
                          ? "bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-md shadow-pink-500/20"
                          : "border border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Fixed Modal: Create / Edit Product (With Stock Quantity Input) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-hidden">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95 duration-200 border border-gray-100">
            {/* Modal Header */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4.5 border-b border-gray-100 flex items-center justify-between rounded-t-3xl shadow-sm">
              <div>
                <h3 className="font-black text-gray-900 text-lg leading-tight">
                  {editingId ? "Edit Product & Stock" : "Create New Product"}
                </h3>
                <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                  Set inventory remaining units, prices, and 3 to 5 images
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-2xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition active:scale-95 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Modal Form Body */}
            <form
              id="productForm"
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-xs font-semibold"
            >
              <div>
                <label className="block text-gray-700 mb-1 font-bold">Product Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Wireless ANC Earbuds"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:border-pink-500 outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1 font-bold">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:border-pink-500 outline-none text-xs font-bold text-gray-800"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Home">Home</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1 font-bold">
                    Stock Quantity (Remaining Units)
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="e.g. 25"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: Number(e.target.value) })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:border-pink-500 outline-none text-xs font-black text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1 font-bold">Rating (1.0 to 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:border-pink-500 outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1 font-bold">Price (₹ MRP)</label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 2999"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:border-pink-500 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 font-bold">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    placeholder="e.g. 20"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:border-pink-500 outline-none text-xs"
                  />
                </div>
              </div>

              {/* Multi-Image Slot Uploader */}
              <div className="space-y-3 p-4 bg-gray-50/80 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Layers className="w-4 h-4 text-pink-600" />
                    <span className="font-extrabold text-gray-800">
                      Product Images ({imageSlots.length} / 5)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                    Min: 3 | Max: 5
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer flex items-center justify-center space-x-2 border-2 border-dashed border-gray-300 hover:border-pink-500 p-3 rounded-xl bg-white transition">
                      <Upload className="w-4 h-4 text-pink-600" />
                      <span className="text-gray-700 font-bold">Choose Files (Local Disk)</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFilesSelect}
                        className="hidden"
                        disabled={imageSlots.length >= 5}
                      />
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-3.5" />
                      <input
                        type="url"
                        placeholder="Or Paste Direct Image URL..."
                        value={formData.urlInput}
                        onChange={(e) => setFormData({ ...formData, urlInput: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-pink-500 text-xs"
                        disabled={imageSlots.length >= 5}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddUrl}
                      disabled={imageSlots.length >= 5 || !formData.urlInput.trim()}
                      className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold disabled:opacity-40 transition cursor-pointer"
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                {imageSlots.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 pt-2">
                    {imageSlots.map((slot, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-xl overflow-hidden border border-gray-200 bg-white aspect-square group shadow-sm"
                      >
                        <img
                          src={slot.previewUrl}
                          alt={`Slot ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(idx)}
                          className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center opacity-90 hover:opacity-100 transition shadow cursor-pointer"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded font-mono">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-1 font-bold">Detailed Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail about product specs, key features, warranty..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:border-pink-500 outline-none text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center space-x-6 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isTrending}
                    onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                    className="accent-pink-600 rounded w-4 h-4"
                  />
                  <span className="text-gray-700">Mark as Trending</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isRecent}
                    onChange={(e) => setFormData({ ...formData, isRecent: e.target.checked })}
                    className="accent-pink-600 rounded w-4 h-4"
                  />
                  <span className="text-gray-700">Mark as New Release</span>
                </label>
              </div>
            </form>

            {/* Modal Sticky Footer */}
            <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-gray-100 flex items-center justify-end space-x-3 rounded-b-3xl shadow-sm">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="productForm"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-pink-500 hover:opacity-95 text-white font-bold rounded-xl text-xs shadow-md shadow-pink-500/20 disabled:opacity-50 transition cursor-pointer"
              >
                {isSubmitting ? "Saving..." : editingId ? "Update Product" : "Save Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}