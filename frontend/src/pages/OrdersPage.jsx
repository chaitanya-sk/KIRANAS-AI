import React, { useState, useEffect } from "react";
import {
  Truck,
  Plus,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Package,
  Layers,
  Phone,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import api from "../api";

export default function OrdersPage({
  products = [],
  suppliers = [],
  onRefresh,
  onOpenOrderModal,
  showToast
}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders");
      setOrders(res.data);
    } catch (err) {
      console.warn("Failed to load orders:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter products needing reorder
  const reorderSuggestions = products.filter(p => (p.reorderQty || 0) > 0 && !p.isDeadStock);

  // Mark an order status (e.g. Delivered which automatically restocks items!)
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await api.put(`/orders/${orderId}`, { status: newStatus });
      showToast?.(`Order updated to "${newStatus}"! ${newStatus === "Delivered" ? "Inventory restocked automatically." : ""}`);
      loadOrders();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Failed to update order status: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold text-emerald-700 tracking-wider uppercase flex items-center gap-1.5">
            <Truck size={13} />
            Smart Replenishment System
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Purchase Orders & Restocking
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Suggested purchase quantities calculated from lead time demand & safety stock buffers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenOrderModal(null)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span>Create Custom PO</span>
          </button>
        </div>
      </div>

      {/* AI REORDER SUGGESTIONS BANNER / CARDS */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Package size={18} className="text-emerald-600" />
              Automated Reorder Suggestions ({reorderSuggestions.length})
            </h3>
            <p className="text-xs text-slate-400">
              Formula: Reorder Quantity = Forecast Demand During Lead Time + Safety Stock - Current Stock
            </p>
          </div>
        </div>

        {reorderSuggestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reorderSuggestions.map(p => (
              <div
                key={p._id}
                className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200/80 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{p.name}</h4>
                      <span className="text-[10px] text-slate-400">{p.category}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                      {p.supplier || "Distributor"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-2.5 p-2 bg-white rounded-lg border border-emerald-100 text-center text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 block">Current</span>
                      <strong className="text-slate-800">{p.stock}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">Lead Time</span>
                      <strong className="text-slate-800">{p.leadTime || 2}d</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-emerald-700 block">Reorder</span>
                      <strong className="text-emerald-800 font-black">{p.reorderQty} units</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Estimated investment: ₹{(p.reorderQty * p.purchasePrice).toLocaleString("en-IN")} at ₹{p.purchasePrice}/unit wholesale cost.
                  </p>
                </div>

                <button
                  onClick={() => onOpenOrderModal(p)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Place PO for {p.reorderQty} units</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl text-xs text-slate-500">
            All high-velocity FMCG items are currently stocked above their reorder points!
          </div>
        )}
      </div>

      {/* ACTIVE & PAST PURCHASE ORDERS */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Truck size={18} className="text-emerald-600" />
              Replenishment Purchase Orders & Tracking
            </h3>
            <p className="text-xs text-slate-400">Marking an order as "Delivered" automatically adds the stock to shelves</p>
          </div>
          <button
            onClick={loadOrders}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            title="Refresh order history"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">PO Number & Date</th>
                <th className="py-3 px-3">Distributor</th>
                <th className="py-3 px-3">Ordered Items</th>
                <th className="py-3 px-3">Total Value</th>
                <th className="py-3 px-3">Expected Cycle</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length > 0 ? (
                orders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {o.poNumber || "PO-2026"}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {o.supplier}
                      {o.supplierPhone && <span className="block text-[10px] text-slate-400 font-normal">{o.supplierPhone}</span>}
                    </td>
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        {o.items?.map((it, i) => {
                          const itQty = it.quantity || 1;
                          const itPrice = it.unitPrice !== undefined ? it.unitPrice : 0;
                          const itTot = it.total !== undefined ? it.total : (itQty * itPrice);
                          return (
                            <div key={i} className="text-slate-700 text-[11px]">
                              • <span className="font-semibold">{it.productName}</span>{" "}
                              <span className="text-slate-500 font-medium">
                                ({itQty} × ₹{Number(itPrice).toFixed(2)} ={" "}
                                <strong className="text-emerald-700">₹{Number(itTot).toFixed(2)}</strong>)
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-black text-slate-900">
                      ₹{Number(o.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {o.expectedDelivery || "In 2-3 business days"}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          o.status === "Delivered"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : o.status === "In Transit"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : o.status === "Dispatched"
                            ? "bg-purple-100 text-purple-800 border border-purple-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {o.status !== "Delivered" ? (
                        <button
                          onClick={() => handleUpdateStatus(o._id, "Delivered")}
                          disabled={updatingId === o._id}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition disabled:opacity-50"
                        >
                          {updatingId === o._id ? "Restocking..." : "Mark Delivered (Restock)"}
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 size={13} /> Stocked into Shelf
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 text-xs">
                    No purchase orders recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
