import React, { useState, useEffect } from "react";
import {
  ReceiptText,
  ShoppingBag,
  IndianRupee,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Calendar,
  CreditCard,
  User
} from "lucide-react";
import api from "../api";
import SaleModal from "../components/SaleModal";

export default function SalesPage({
  products = [],
  onRefresh,
  showToast
}) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchInvoice, setSearchInvoice] = useState("");

  const loadSales = async () => {
    try {
      setLoading(true);
      const res = await api.get("/sales");
      setSales(res.data);
    } catch (err) {
      console.warn("Failed to load sales transactions:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  const handleRecordSale = async (saleData) => {
    const res = await api.post("/sales", saleData);
    showToast?.(`Sale recorded! Stock updated for ${res.data?.sale?.productName}`);
    loadSales();
    if (onRefresh) onRefresh();
  };

  const salesList = Array.isArray(sales) ? sales : [];
  const filteredSales = salesList.filter(s => {
    if (!s) return false;
    const q = (searchInvoice || "").toLowerCase();
    return (
      (s.productName && s.productName.toLowerCase().includes(q)) ||
      (s.invoiceNumber && s.invoiceNumber.toLowerCase().includes(q)) ||
      (s.customerName && s.customerName.toLowerCase().includes(q))
    );
  });

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const todayTotal = salesList
    .filter(s => {
      const d = s.soldAt || s.createdAt || s.date;
      return d ? new Date(d).getTime() >= todayStart : false;
    })
    .reduce((sum, s) => sum + (Number(s.total) || 0), 0);

  const totalVolume = salesList.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold text-emerald-700 tracking-wider uppercase flex items-center gap-1.5">
            <ReceiptText size={13} />
            Counter POS & Transactions
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Sales Ledger & Register
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant shelf stock deduction and daily sales velocity calculations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span>Record New Sale</span>
          </button>
        </div>
      </div>

      {/* Sales Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Today's Cashflow</span>
          <div className="text-3xl font-black text-emerald-800">
            ₹{todayTotal.toLocaleString("en-IN")}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Live counter register</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Items Sold</span>
          <div className="text-3xl font-black text-slate-900">
            {totalVolume.toLocaleString("en-IN")} <span className="text-sm font-normal text-slate-400">units</span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Across past 30 days</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Invoices Logged</span>
          <div className="text-3xl font-black text-slate-900">
            {sales.length}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Historical counter receipts</span>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-3 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80 relative">
            <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product, invoice or customer..."
              value={searchInvoice}
              onChange={(e) => setSearchInvoice(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={loadSales}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            title="Refresh sales list"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Invoice & Time</th>
                <th className="py-2.5 px-3">Product Sold</th>
                <th className="py-2.5 px-3">Quantity</th>
                <th className="py-2.5 px-3">Unit Price</th>
                <th className="py-2.5 px-3">Total Amount</th>
                <th className="py-2.5 px-3">Payment Method</th>
                <th className="py-2.5 px-3">Customer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.slice(0, 50).map((s, idx) => (
                <tr key={s._id || idx} className="hover:bg-slate-50/60 transition">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                    {s.invoiceNumber || `INV-${1000 + idx}`}
                    <span className="block text-[10px] text-slate-400 font-normal font-sans">
                      {new Date(s.soldAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, {new Date(s.soldAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {s.productName}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                    {s.quantity} units
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    ₹{s.unitPrice}
                  </td>
                  <td className="py-2.5 px-3 font-black text-emerald-800">
                    ₹{s.total}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        s.paymentMethod === "UPI"
                          ? "bg-blue-100 text-blue-800"
                          : s.paymentMethod === "Khata"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {s.paymentMethod || "Cash"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {s.customerName || "Walk-in Customer"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SaleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleRecordSale}
        products={products}
      />
    </div>
  );
}
