import React, { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Clock,
  Truck,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Filter,
  Info
} from "lucide-react";

const PRIORITY_FILTERS = ["All", "Critical", "Low Stock", "Healthy", "Dead Stock"];

export default function PredictionsPage({
  products = [],
  onOpenOrderModal
}) {
  const [selectedPriority, setSelectedPriority] = useState("All");

  const filteredPredictions = products.filter(p => {
    if (selectedPriority === "All") return true;
    if (selectedPriority === "Dead Stock") return p.isDeadStock;
    return p.status === selectedPriority;
  });

  return (
    <div className="space-y-6">
      {/* Title & Algorithm Architecture Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold text-emerald-700 tracking-wider uppercase flex items-center gap-1.5">
            <Sparkles size={13} />
            Mathematical Forecasting Engine
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            AI Demand Prediction & Stockout Guard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Algorithmic replenishment based on daily sales velocity, supplier lead time and safety stock
          </p>
        </div>
      </div>

      {/* Formula Explanation Callout */}
      <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 text-xs text-slate-700 space-y-2">
        <div className="flex items-center gap-2 font-bold text-emerald-950">
          <Info size={16} className="text-emerald-700" />
          <span>FMCG Reorder Formula Active:</span>
        </div>
        <p className="text-[11px] text-slate-600 font-mono bg-white p-2.5 rounded-xl border border-emerald-100">
          Reorder Quantity = max(0, ceil(DailySales × LeadTime + SafetyStock - CurrentStock))
        </p>
        <p className="text-[11px] text-slate-500">
          Our algorithm ensures Kiranas never run out of fast-moving products like Parle-G and Maggi while shielding working capital from excess overstocking.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
          Filter Risk Level:
        </span>
        {PRIORITY_FILTERS.map(pri => (
          <button
            key={pri}
            onClick={() => setSelectedPriority(pri)}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              selectedPriority === pri
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {pri}
          </button>
        ))}
      </div>

      {/* Prediction Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPredictions.map(p => {
          const isCritical = p.status === "Critical" || p.status === "Stocked Out";
          const isLow = p.status === "Low Stock";

          return (
            <div
              key={p._id}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition hover:shadow-md ${
                isCritical
                  ? "border-red-200 bg-red-50/15"
                  : isLow
                  ? "border-amber-200 bg-amber-50/15"
                  : p.isDeadStock
                  ? "border-slate-300 bg-slate-50/30"
                  : "border-slate-200/80"
              }`}
            >
              <div>
                {/* Header Badge & Name */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 leading-snug">{p.name}</h3>
                    <span className="text-[10px] text-slate-400 font-medium">{p.category}</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                      isCritical
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : isLow
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : p.isDeadStock
                        ? "bg-slate-200 text-slate-700"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                {/* Key Metric Numbers Matrix */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-center my-3">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-semibold">Stock</span>
                    <strong className="text-sm font-black text-slate-800">{p.stock}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-semibold">Velocity</span>
                    <strong className="text-sm font-black text-emerald-800">{p.dailySales}/d</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-semibold">Days Left</span>
                    <strong className={`text-sm font-black ${p.daysLeft !== null && p.daysLeft <= 3 ? "text-red-600" : "text-slate-800"}`}>
                      {p.daysLeft !== null ? `${p.daysLeft}d` : "—"}
                    </strong>
                  </div>
                </div>

                {/* Detailed Analysis Breakdown */}
                <div className="space-y-1.5 text-xs text-slate-600 my-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">7-Day Demand Forecast:</span>
                    <span className="font-bold text-slate-800">{p.forecast7} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Distributor Lead Time:</span>
                    <span className="font-semibold text-slate-700">{p.leadTime || 2} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Safety Buffer:</span>
                    <span className="font-semibold text-slate-700">{p.safetyStock || 5} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated Stockout Date:</span>
                    <span className="font-bold text-red-600">{p.stockoutDate || "N/A"}</span>
                  </div>
                </div>

                {/* Human-Readable Reason */}
                <div className="p-3 bg-white rounded-xl border border-slate-100 text-[11px] leading-relaxed text-slate-600 mb-4">
                  <strong className="text-slate-800 block text-[10px] uppercase font-bold text-emerald-800 mb-0.5">
                    Algorithm Recommendation:
                  </strong>
                  {p.recommendation || p.reason}
                </div>
              </div>

              {/* Bottom Reorder Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Suggested Reorder:</span>
                  <span className="text-base font-black text-emerald-800">
                    {p.reorderQty || 0} <span className="text-xs font-normal text-slate-500">{p.unit || "units"}</span>
                  </span>
                </div>

                {p.reorderQty > 0 ? (
                  <button
                    onClick={() => onOpenOrderModal(p)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-sm"
                  >
                    <span>Create PO</span>
                    <ArrowRight size={13} />
                  </button>
                ) : (
                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Optimal Buffer
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
