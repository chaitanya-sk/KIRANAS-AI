import React, { useState, useEffect } from "react";
import {
  Skull,
  AlertOctagon,
  IndianRupee,
  Clock,
  TrendingDown,
  Tag,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  PackageX,
  FileSpreadsheet
} from "lucide-react";
import api from "../api";

export default function DeadStockPage({ products = [], onRefresh, showToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDeadStock = async () => {
    try {
      setLoading(true);
      const res = await api.get("/dead-stock");
      setData(res.data);
    } catch (err) {
      console.warn("Failed to load dead stock report:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeadStock();
  }, [products]);

  const deadStockItems = data?.deadStock || products.filter(p => p.isDeadStock);
  const slowMovingItems = data?.slowMoving || products.filter(p => p.isSlowMoving);
  const totalBlocked = data?.summary?.totalBlockedCapital || deadStockItems.reduce((s, p) => s + (p.blockedCapital || (p.stock * p.purchasePrice)), 0);
  const totalSlowBlocked = data?.summary?.totalSlowCapital || slowMovingItems.reduce((s, p) => s + (p.stock * p.purchasePrice), 0);
  const potentialRecovery = Math.round(totalBlocked * 0.85);

  const handleApplyDiscount = (p) => {
    showToast?.(`Generated clearance promotion for "${p.name}". Bundle at 15% discount recommended!`);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold text-red-600 tracking-wider uppercase flex items-center gap-1.5">
            <AlertOctagon size={13} />
            Working Capital Recovery
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Dead Stock & Slow-Moving Inventory Sentinel
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Unfreeze tied-up capital from non-moving SKUs sitting idle on your rural store shelves
          </p>
        </div>
        <button
          onClick={loadDeadStock}
          className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh Audit</span>
        </button>
      </div>

      {/* 3 CAPITAL METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Blocked */}
        <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Blocked Capital in Dead Stock</span>
            <div className="p-2 bg-red-100 text-red-700 rounded-xl">
              <Skull size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-red-600">
            ₹{totalBlocked.toLocaleString("en-IN")}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cash frozen in {deadStockItems.length} products with no customer sales for 21+ days
          </p>
        </div>

        {/* Slow Moving Capital */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Slow-Moving Inventory</span>
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-800">
            ₹{totalSlowBlocked.toLocaleString("en-IN")}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {slowMovingItems.length} products rotating very slowly (&lt;1 sale/day, 10+ days since sale)
          </p>
        </div>

        {/* Estimated Recovery Projection */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Unblockable Cash Projection</span>
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-800">
            ₹{potentialRecovery.toLocaleString("en-IN")}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Estimated immediate recovery via 15% clearance discount bundles or distributor returns
          </p>
        </div>
      </div>

      {/* DEAD STOCK CANDIDATES SECTION */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <PackageX size={18} className="text-red-600" />
              Dead Stock Candidates (&gt;21 Days Inactive)
            </h3>
            <p className="text-xs text-slate-400">Zero recent customer demand. Do not purchase any more of these items.</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-red-100 text-red-700 rounded-full">
            {deadStockItems.length} Flagged SKUs
          </span>
        </div>

        {deadStockItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deadStockItems.map(p => (
              <div
                key={p._id}
                className="p-4 bg-red-50/40 rounded-xl border border-red-200 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{p.name}</h4>
                      <span className="text-[11px] text-slate-500">{p.category} · Supplier: {p.supplier}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200">
                      {p.lastSaleDays} Days Idle
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-3 p-2.5 bg-white rounded-lg border border-red-100 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Unsold Stock</span>
                      <strong className="text-slate-800">{p.stock} units</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Unit Cost</span>
                      <strong className="text-slate-800">₹{p.purchasePrice}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-red-600 block">Blocked Capital</span>
                      <strong className="text-red-600 font-black">₹{p.blockedCapital || (p.stock * p.purchasePrice)}</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong>Recovery Strategy:</strong> {p.recommendation || `Liquidate ${p.stock} units by bundling with fast-selling Maggi or Parle-G at ₹${Math.round(p.sellingPrice * 0.85)}.`}
                  </p>
                </div>

                <div className="pt-2 border-t border-red-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-red-700">Action: Halt All Future Orders</span>
                  <button
                    onClick={() => handleApplyDiscount(p)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-xs"
                  >
                    <Tag size={12} />
                    <span>Apply 15% Clearance Bundle</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl text-xs text-slate-500">
            Awesome! No dead stock detected in this store catalog.
          </div>
        )}
      </div>

      {/* SLOW-MOVING PRODUCTS SECTION */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <TrendingDown size={18} className="text-amber-600" />
              Slow-Moving FMCG Products (10–20 Days Inactive)
            </h3>
            <p className="text-xs text-slate-400">Low turnover rates. Move items to front billing counter to accelerate sale.</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full">
            {slowMovingItems.length} Products
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                <th className="pb-2.5">Product</th>
                <th className="pb-2.5">Stock</th>
                <th className="pb-2.5">Cost</th>
                <th className="pb-2.5">Days Since Sale</th>
                <th className="pb-2.5">Capital Tied</th>
                <th className="pb-2.5 text-right">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {slowMovingItems.map(p => (
                <tr key={p._id} className="hover:bg-slate-50/60">
                  <td className="py-2.5 font-bold text-slate-800">
                    {p.name}
                    <span className="block text-[10px] text-slate-400 font-normal">{p.category}</span>
                  </td>
                  <td className="py-2.5 font-bold text-slate-700">{p.stock} units</td>
                  <td className="py-2.5 text-slate-600">₹{p.purchasePrice}</td>
                  <td className="py-2.5 font-bold text-amber-700">{p.lastSaleDays} days</td>
                  <td className="py-2.5 font-black text-slate-900">₹{p.stock * p.purchasePrice}</td>
                  <td className="py-2.5 text-right">
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Display at Front Counter
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
