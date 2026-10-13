import React, { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  CheckCircle,
  Clock,
  Filter,
  MessageSquare,
  Phone,
  Mail,
  FileText
} from "lucide-react";
import API from "../../api/axios";

export default function ContactInquiries() {
  const [queries, setQueries] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // Note Modal
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [noteText, setNoteText] = useState("");

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/contact/queries?status=${statusFilter}&search=${search}`);
      if (res.data?.success) {
        setQueries(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQueries();
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.patch(`/contact/queries/${id}`, { status: newStatus });
      fetchQueries();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      await API.delete(`/contact/queries/${id}`);
      fetchQueries();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleSaveNote = async () => {
    if (!selectedQuery) return;
    try {
      await API.patch(`/contact/queries/${selectedQuery._id}`, { adminNotes: noteText });
      setSelectedQuery(null);
      fetchQueries();
    } catch (err) {
      alert("Failed to save note");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Resolved":
        return "bg-emerald-100 text-emerald-800";
      case "Closed":
        return "bg-slate-200 text-slate-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Customer Support Inquiries (CRM)</h1>
          <p className="text-xs text-slate-500">Track and respond to incoming inquiries and support tickets.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center space-x-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search user, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs border rounded-xl outline-none focus:border-pink-500"
            />
          </form>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border rounded-xl px-2.5 py-1.5 font-bold text-slate-700 outline-none"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b">
              <tr>
                <th className="p-3.5">User Details</th>
                <th className="p-3.5">Subject</th>
                <th className="p-3.5">Message</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Created At</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-400">
                    Loading inquiries...
                  </td>
                </tr>
              ) : queries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-400">
                    No inquiries found.
                  </td>
                </tr>
              ) : (
                queries.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-50/60">
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{q.name}</p>
                      <p className="text-[11px] text-slate-400 flex items-center space-x-1">
                        <Mail className="w-3 h-3" /> <span>{q.email}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center space-x-1">
                        <Phone className="w-3 h-3" /> <span>{q.phone}</span>
                      </p>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">{q.subject}</td>
                    <td className="p-3.5 max-w-xs">
                      <p className="truncate text-slate-600">{q.message}</p>
                      {q.adminNotes && (
                        <p className="text-[10px] text-pink-600 font-bold mt-1">Note: {q.adminNotes}</p>
                      )}
                    </td>
                    <td className="p-3.5">
                      <select
                        value={q.status}
                        onChange={(e) => handleStatusChange(q._id, e.target.value)}
                        className={`text-[11px] font-extrabold px-2 py-1 rounded-lg border-0 outline-none ${getStatusBadge(
                          q.status
                        )}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        title="Add/View Note"
                        onClick={() => {
                          setSelectedQuery(q);
                          setNoteText(q.adminNotes || "");
                        }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        title="Delete Ticket"
                        onClick={() => handleDelete(q._id)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-rose-600"
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
      </div>

      {/* Internal Note Modal */}
      {selectedQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-3">
            <h3 className="font-bold text-sm">Internal CRM Note ({selectedQuery.name})</h3>
            <textarea
              rows={4}
              placeholder="e.g. Called user, replacement item dispatched under tracking #12345"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full text-xs p-2.5 border rounded-xl"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setSelectedQuery(null)}
                className="px-3 py-1.5 text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-1.5 bg-pink-600 text-white rounded-xl text-xs font-bold"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}