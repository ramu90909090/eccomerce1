import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Layers,
  MessageSquare,
  HelpCircle,
  PhoneCall,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import API from "../../api/axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalQueries: 0,
    pendingQueries: 0,
    resolvedQueries: 0,
    totalFaqs: 0,
    totalCards: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [queriesRes, cmsRes] = await Promise.all([
          API.get("/contact/queries?limit=100"),
          API.get("/contact/config")
        ]);

        const queries = queriesRes.data?.data || [];
        const config = cmsRes.data?.data || {};

        setStats({
          totalQueries: queriesRes.data?.total || queries.length,
          pendingQueries: queries.filter((q) => q.status === "Pending").length,
          resolvedQueries: queries.filter((q) => q.status === "Resolved").length,
          totalFaqs: config.faqs?.length || 0,
          totalCards: config.carouselCards?.length || 0
        });
      } catch (err) {
        console.error("Dashboard stats error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: "Total Inquiries",
      value: stats.totalQueries,
      desc: "Total tickets in CRM",
      icon: MessageSquare,
      color: "from-blue-600 to-cyan-500",
      link: "/admin/contact-inquiries"
    },
    {
      title: "Pending Tickets",
      value: stats.pendingQueries,
      desc: "Requires quick response",
      icon: Clock,
      color: "from-amber-500 to-orange-500",
      link: "/admin/contact-inquiries"
    },
    {
      title: "Resolved Inquiries",
      value: stats.resolvedQueries,
      desc: "Closed tickets",
      icon: CheckCircle,
      color: "from-emerald-500 to-teal-500",
      link: "/admin/contact-inquiries"
    },
    {
      title: "Live FAQs & Touchpoints",
      value: stats.totalFaqs + stats.totalCards,
      desc: "Configured CMS elements",
      icon: Layers,
      color: "from-violet-600 to-pink-500",
      link: "/admin/contact-cms"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Admin Master Control Hub
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time management for store CMS, customer inquiries, and system operations.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Operational Online</span>
          </span>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              to={item.link}
              className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-black text-gray-900">
                  {loading ? "--" : item.value}
                </h3>
                <p className="text-xs font-bold text-gray-700 mt-0.5">{item.title}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{item.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Access Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: CRM Tickets */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-pink-600" />
              <h2 className="font-bold text-base text-gray-900">Inquiry & Ticket CRM</h2>
            </div>
            <Link
              to="/admin/contact-inquiries"
              className="text-xs font-bold text-pink-600 hover:text-violet-600 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Users dwara bheji gayi saari direct queries ko track karein, customer notes add karein aur unka status Pending, In Progress, ya Resolved mark karein.
          </p>
          <div className="pt-2">
            <Link
              to="/admin/contact-inquiries"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-pink-50 text-gray-700 hover:text-pink-600 rounded-xl text-xs font-bold transition border border-gray-100"
            >
              <span>Open Tickets CRM</span>
            </Link>
          </div>
        </div>

        {/* Module 2: Page CMS */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-violet-600" />
              <h2 className="font-bold text-base text-gray-900">Contact Us Page CMS</h2>
            </div>
            <Link
              to="/admin/contact-cms"
              className="text-xs font-bold text-violet-600 hover:text-pink-600 flex items-center space-x-1"
            >
              <span>Manage CMS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Contact Us page ka banner tagline, carousel contact cards, Google Maps location iframe, visiting hours aur dynamic FAQ list ko edit ya customize karein.
          </p>
          <div className="pt-2">
            <Link
              to="/admin/contact-cms"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-violet-50 text-gray-700 hover:text-violet-600 rounded-xl text-xs font-bold transition border border-gray-100"
            >
              <span>Open Page Editor</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}