import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Boxes,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  Skull,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Package,
  Layers,
  ChevronRight
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import api from "../api";

const PIE_COLORS = ["#059669", "#10b981", "#34d399", "#6ee7b7", "#047857", "#065f46", "#0f766e", "#14b8a6"];

export default function DashboardPage({
  summary,
  onRefresh,
  onOpenSaleModal,
  onOpenProductModal,
  onOpenOrderModal
}) {
  const [report, setReport] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardDetails = async () => {
    try {
      setLoading(true);
      const [repRes, salesRes, ordersRes] = await Promise.all([
        api.get("/reports/overview"),
        api.get("/sales"),
        api.get("/orders")
      ]);
      setReport(repRes.data);
      setRecentSales(salesRes.data.slice(0, 5));
      setRecentOrders(ordersRes.data.slice(0, 4));
    } catch (err) {
      console.warn("Error loading dashboard reports:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardDetails();
  }, []);

  const handleRefreshAll = () => {
    if (onRefresh) onRefresh();
    loadDashboardDetails();
  };

  const products = summary?.products || [];

  // Bar chart: compare current stock vs 7-day forecast demand for top items
  const demandChartData = products.slice(0, 7).map(p => ({
    name: p.name.split(" ")[0] + " " + (p.name.split(" ")[1] || ""),
    Stock: p.stock,
    "7-Day Demand": p.forecast7 || Math.ceil((p.dailySales || 1) * 7)
  }));

  // Pie chart: Category inventory distribution
  const categoryData = report?.categoryDistribution || [
    { category: "Biscuits & Snacks", count: 4, value: 1250 },
    { category: "Staples & Grains", count: 3, value: 8900 },
    { category: "Cooking Oil", count: 2, value: 4500 },
    { category: "Personal Care", count: 4, value: 3100 },
    { category: "Detergents", count: 2, value: 5200 }
  ];

  // Critical alerts to show on dashboard
  const criticalItems = products.filter(p => p.status === "Critical" || p.status === "Stocked Out").slice(0, 4);
  const deadStockItems = products.filter(p => p.isDeadStock).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <span className="text-[11px] font-extrabold text-emerald-700 tracking-wider uppercase">
            Store Performance & Health
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Retailer Control Center
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshAll}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Sync Data</span>
          </button>
          <button
            onClick={onOpenSaleModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
          >
            <ShoppingBag size={14} />
            <span>Record Sale</span>
          </button>
        </div>
      </div>

      {/* 6 SUMMARY KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. Total Products */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total SKUs</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
              <Boxes size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {summary?.totalProducts || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Catalog items tracked</div>
        </div>

        {/* 2. Total Inventory Value */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Inventory Value</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
              <IndianRupee size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{(summary?.inventoryValue || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-1">At wholesale cost</div>
        </div>

        {/* 3. Today's Sales */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's Sales</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-800">
            ₹{(summary?.todaySales || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Real-time counter POS</div>
        </div>

        {/* 4. Low Stock Products */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Low Stock</span>
            <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700">
            {summary?.lowStock || 0}
          </div>
          <div className="text-[10px] text-amber-700 font-semibold mt-1">Below reorder point</div>
        </div>

        {/* 5. Dead Stock Value */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Dead Stock</span>
            <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
              <Skull size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-red-600">
            ₹{(summary?.deadStockValue || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-red-600 font-semibold mt-1">Tied-up cash to recover</div>
        </div>

        {/* 6. Stockout Risk */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Stockout Risk</span>
            <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-900">
            {summary?.stockoutRiskPercent || 0}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {summary?.stockoutRiskCount || 0} critical SKUs
          </div>
        </div>
      </div>

      {/* AI RECOMMENDATIONS TICKER */}
      <div className="p-4 bg-gradient-to-r from-emerald-50 via-emerald-50/60 to-white rounded-2xl border border-emerald-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-600/20">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-950 flex items-center gap-2">
              <span>AI Prescriptive Insights:</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-emerald-200/70 text-emerald-800 rounded">
                Real-Time
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {criticalItems.length > 0
                ? `Critical: Parle-G & ${criticalItems[0]?.name} will run out before supplier lead time. Reorder ${criticalItems[0]?.reorderQty || 48} units today.`
                : "All fast-moving staples have healthy buffers for this week's delivery cycle."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/predictions"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-sm"
          >
            <span>View All Forecasts</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Stock vs 7-Day Demand Bar Chart */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Current Stock vs 7-Day Demand Forecast</h3>
              <p className="text-xs text-slate-400">Comparing shelf stock depth against estimated customer consumption</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
              AI Forecast
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demandChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f3" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "10px", color: "#fff", fontSize: "12px", border: "none" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Bar dataKey="Stock" fill="#059669" radius={[4, 4, 0, 0]} barSize={18} />
                <Bar dataKey="7-Day Demand" fill="#93c5fd" radius={[4, 4, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Category Distribution Pie Chart */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Inventory Value by Category</h3>
                <p className="text-xs text-slate-400">Capital allocation across FMCG departments</p>
              </div>
            </div>

            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`₹${Number(val).toLocaleString("en-IN")}`, "Inventory Value"]}
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
            {categoryData.slice(0, 4).map((c, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-slate-600 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                <span className="truncate">{c.category}: ₹{Number(c.value).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* OPERATIONAL TABLES: TOP SELLERS & NEEDS ATTENTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top-Selling Products */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Top-Selling FMCG Products</h3>
              <p className="text-xs text-slate-400">High velocity items that drive daily cashflow</p>
            </div>
            <Link to="/inventory" className="text-xs font-bold text-emerald-700 hover:underline">
              Manage Catalog →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-2.5">Product</th>
                  <th className="pb-2.5">Velocity</th>
                  <th className="pb-2.5">Stock</th>
                  <th className="pb-2.5">Days Left</th>
                  <th className="pb-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products
                  .filter(p => !p.isDeadStock)
                  .sort((a, b) => b.dailySales - a.dailySales)
                  .slice(0, 5)
                  .map(p => (
                    <tr key={p._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 font-bold text-slate-800">
                        {p.name}
                        <span className="block text-[10px] text-slate-400 font-normal">{p.category}</span>
                      </td>
                      <td className="py-2.5 font-semibold text-emerald-800">
                        {p.dailySales} /day
                      </td>
                      <td className="py-2.5 font-bold text-slate-700">
                        {p.stock} {p.unit || "pcs"}
                      </td>
                      <td className="py-2.5 font-medium text-slate-600">
                        {p.daysLeft ? `${p.daysLeft}d` : "—"}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === "Critical"
                              ? "bg-red-100 text-red-700"
                              : p.status === "Low Stock"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low-Stock & Dead Stock Urgent Alerts */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Urgent Store Attention</h3>
              <p className="text-xs text-slate-400">Immediate action needed to prevent loss</p>
            </div>
            <Link to="/orders" className="text-xs font-bold text-emerald-700 hover:underline">
              Create POs →
            </Link>
          </div>

          <div className="space-y-3">
            {criticalItems.length > 0 ? (
              criticalItems.map(p => (
                <div
                  key={p._id}
                  className="p-3 bg-red-50/70 rounded-xl border border-red-200/70 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800">{p.name}</div>
                    <div className="text-[10px] text-red-700 mt-0.5">
                      Stock {p.stock} will run out in {p.daysLeft} days (Lead: {p.leadTime}d)
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenOrderModal(p)}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg shrink-0 shadow-xs"
                  >
                    + Reorder {p.reorderQty}
                  </button>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                No critical stockout risks right now!
              </div>
            )}

            {deadStockItems.map(p => (
              <div
                key={p._id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800">{p.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Unsold for {p.lastSaleDays} days · ₹{p.blockedCapital} cash frozen
                  </div>
                </div>
                <Link
                  to="/dead-stock"
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold rounded-lg shrink-0"
                >
                  Purge Plan
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT COUNTER ACTIVITY & REPLENISHMENT BATCHES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Counter Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <ShoppingBag size={16} className="text-emerald-600" /> Recent POS Counter Sales
            </h3>
            <Link to="/sales" className="text-xs font-bold text-emerald-700 hover:underline">
              View All POS →
            </Link>
          </div>

          <div className="space-y-2">
            {recentSales.length > 0 ? (
              recentSales.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{s.productName}</div>
                    <div className="text-[10px] text-slate-400">
                      Qty: {s.quantity} · {s.paymentMethod || "Cash"} · {new Date(s.soldAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <span className="font-extrabold text-emerald-800">
                    +₹{s.total}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">No sales logged today yet.</p>
            )}
          </div>
        </div>

        {/* Recent Purchase Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Package size={16} className="text-emerald-600" /> Recent Replenishment Orders
            </h3>
            <Link to="/orders" className="text-xs font-bold text-emerald-700 hover:underline">
              View All POs →
            </Link>
          </div>

          <div className="space-y-2">
            {recentOrders.length > 0 ? (
              recentOrders.map((o, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{o.supplier}</div>
                    <div className="text-[10px] text-slate-400">
                      {o.poNumber || "PO"} · {o.items?.length || 1} items · {o.expectedDelivery || "In transit"}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-800 block">₹{o.total?.toLocaleString("en-IN")}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        o.status === "Delivered"
                          ? "bg-emerald-100 text-emerald-800"
                          : o.status === "In Transit"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">No purchase orders placed yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
