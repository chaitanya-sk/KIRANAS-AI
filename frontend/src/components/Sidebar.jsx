import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Store,
  LayoutDashboard,
  Boxes,
  Sparkles,
  AlertOctagon,
  Truck,
  Building2,
  ReceiptText,
  LogOut,
  Database,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/inventory", label: "Inventory", icon: Boxes },
  { path: "/predictions", label: "AI Predictions", icon: Sparkles, badge: "AI" },
  { path: "/dead-stock", label: "Dead Stock Watch", icon: AlertOctagon },
  { path: "/orders", label: "Smart Reorders", icon: Truck },
  { path: "/suppliers", label: "Distributors", icon: Building2 },
  { path: "/sales", label: "Counter POS / Sales", icon: ReceiptText }
];

export default function Sidebar({ isOpen, onClose, systemStatus }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <Store size={22} />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-emerald-950 flex items-center gap-1.5">
                KIRANAS
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400">Rural FMCG & Logistics</p>
            </div>
          </Link>
        </div>

        {/* Current Store Box */}
        <div className="px-4 py-3 m-3 bg-emerald-50/70 rounded-xl border border-emerald-100/80">
          <div className="flex items-center justify-between text-[11px] text-emerald-800 font-semibold mb-0.5">
            <span>ACTIVE STORE</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="text-xs font-bold text-slate-800 truncate">
            {user?.shopName || "Sharma General & Kirana"}
          </div>
          <div className="text-[10px] text-slate-500 truncate mt-0.5">
            {user?.location || "Main Mandi Road, Gram Panchayat"}
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 px-3 uppercase tracking-wider mb-2">
            Store Operations
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 mt-2 border-t border-slate-100">
            <Link
              to="/"
              className="flex items-center justify-between px-3.5 py-2 text-xs font-medium text-slate-500 hover:text-emerald-700 hover:bg-slate-50 rounded-xl transition"
            >
              <div className="flex items-center gap-2.5">
                <ExternalLink size={16} />
                <span>Landing Page</span>
              </div>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* System & Database Status */}
        <div className="p-3 border-t border-slate-100">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <Database size={13} className="text-emerald-600" /> Storage Engine:
              </span>
              <span className="font-bold text-slate-800 capitalize">
                {systemStatus?.database || "In-Memory"}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              {systemStatus?.database === "mongodb"
                ? "Connected to MongoDB replica"
                : "Zero-config demo mode with sample data"}
            </div>
          </div>
        </div>

        {/* User Profile & Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "R"}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-800 truncate">
                {user?.name || "Ramesh Sharma"}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {user?.email || "shopkeeper@kiranas.in"}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
