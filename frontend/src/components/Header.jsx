import React from "react";
import { Menu, Plus, ShoppingBag, Truck, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header({
  onToggleSidebar,
  title = "Retailer Dashboard",
  subtitle = "Rural FMCG Inventory Intelligence",
  onOpenSale,
  onOpenProduct,
  onOpenOrder,
  lowStockCount = 0
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-500 hover:text-emerald-800 hover:bg-slate-100 rounded-xl md:hidden transition"
          aria-label="Open Navigation"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-lg md:text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            {title}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>
        </div>
      </div>

      {/* Right Actions & Notifications */}
      <div className="flex items-center gap-2.5">
        {/* Low Stock Alert Pill */}
        {lowStockCount > 0 && (
          <Link
            to="/predictions"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold hover:bg-amber-100 transition"
            title="Products at risk of stockout"
          >
            <AlertTriangle size={14} className="text-amber-600 animate-pulse" />
            <span>{lowStockCount} Critical</span>
          </Link>
        )}

        {/* Quick Sale Shortcut */}
        <button
          onClick={onOpenSale}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition shadow-xs"
        >
          <ShoppingBag size={15} />
          <span>+ Quick Sale</span>
        </button>

        {/* Quick Product Shortcut */}
        <button
          onClick={onOpenProduct}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
        >
          <Plus size={15} />
          <span className="hidden md:inline">Add Product</span>
        </button>

        {/* Quick Order Shortcut */}
        <button
          onClick={onOpenOrder}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition"
        >
          <Truck size={15} />
          <span>New PO</span>
        </button>
      </div>
    </header>
  );
}
