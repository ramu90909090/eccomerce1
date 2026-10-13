import React, { useState } from "react";
import { NavLink, Link, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Layers,
  Info,
  MessageSquare,
  Package,
  ShoppingBag,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  // navItems array me yeh item add karein:
const navItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "About Us CMS", to: "/admin/about-cms", icon: Info },
  { label: "Contact Us CMS", to: "/admin/contact-cms", icon: Layers },
  { label: "Contact CRM Tickets", to: "/admin/contact-inquiries", icon: MessageSquare }
];

  const getLinkClasses = ({ isActive }) =>
    `flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
      isActive
        ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-md shadow-pink-500/20"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 h-screen z-50 bg-white border-r border-slate-200/80 transition-all duration-300 flex flex-col justify-between p-4 ${
          collapsed ? "w-20" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="space-y-6">
          {/* Logo & Collapse Header */}
          <div className="flex items-center justify-between px-1">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              {!collapsed && (
                <div>
                  <span className="font-black text-sm tracking-tight bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                    KHASTORE
                  </span>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase -mt-0.5">
                    Admin Studio
                  </span>
                </div>
              )}
            </Link>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500"
              title="Toggle Sidebar"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={getLinkClasses}
                  title={collapsed ? item.label : ""}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-500 hover:text-pink-600 hover:bg-pink-50 text-xs font-bold transition"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Live Public Store</span>}
          </Link>
          {!collapsed && (
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-violet-600 text-white font-bold text-xs flex items-center justify-center">
                {user?.name?.charAt(0) || "A"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-black text-slate-900 truncate">{user?.name}</p>
                <p className="text-[9px] font-bold text-violet-600 uppercase">Super Admin</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl border border-slate-200 text-slate-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-black text-sm bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
            Admin Studio
          </span>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}