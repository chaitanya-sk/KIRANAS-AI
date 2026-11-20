import React, { useState, useEffect } from "react";
import { X, PackagePlus, AlertCircle, IndianRupee, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

const CATEGORIES = [
  "Biscuits & Snacks",
  "Instant Food",
  "Staples & Grains",
  "Cooking Oil & Ghee",
  "Personal Care",
  "Detergents & Cleaning",
  "Beverages & Tea",
  "Spices & Condiments"
];

const UNITS = ["packet", "sachet", "kg", "litre", "pouch", "bottle", "tube", "box", "bar", "pcs"];

export default function ProductModal({ isOpen, onClose, onSave, initialData = null, suppliers = [] }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "Biscuits & Snacks",
    brand: "",
    unit: "packet",
    stock: 25,
    purchasePrice: 10,
    sellingPrice: 15,
    dailySales: 4,
    leadTime: 2,
    safetyStock: 8,
    supplier: "Shree Ram FMCG Distributors",
    expiryDate: "2027-12-31"
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        category: initialData.category || "Biscuits & Snacks",
        brand: initialData.brand || "",
        unit: initialData.unit || "packet",
        stock: initialData.stock ?? 20,
        purchasePrice: initialData.purchasePrice ?? initialData.purchaseCost ?? 10,
        sellingPrice: initialData.sellingPrice ?? initialData.mrp ?? 12,
        dailySales: initialData.dailySales ?? 5,
        leadTime: initialData.leadTime ?? 2,
        safetyStock: initialData.safetyStock ?? initialData.minStockLevel ?? 10,
        supplier: initialData.supplier || (suppliers[0]?.name || "Shree Ram FMCG Distributors"),
        expiryDate: initialData.expiryDate || "2027-12-31"
      });
    } else {
      setFormData({
        name: "",
        category: "Biscuits & Snacks",
        brand: "",
        unit: "packet",
        stock: 25,
        purchasePrice: 10,
        sellingPrice: 15,
        dailySales: 4,
        leadTime: 2,
        safetyStock: 8,
        supplier: suppliers[0]?.name || "Shree Ram FMCG Distributors",
        expiryDate: "2027-12-31"
      });
    }
    setError("");
  }, [initialData, isOpen, suppliers]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      // For price inputs, keep raw text if empty or typing decimal to prevent cursor jump
      [name]: type === "number" ? (value === "" ? "" : value) : value
    }));
  };

  const pPrice = Number(formData.purchasePrice) || 0;
  const sPrice = Number(formData.sellingPrice) || 0;
  const profitPerUnit = sPrice - pPrice;
  // User's formula: ((sellingPrice - purchasePrice) / sellingPrice) * 100
  const profitMarginPercent = sPrice > 0 ? ((sPrice - pPrice) / sPrice) * 100 : 0;
  const markupPercent = pPrice > 0 ? ((sPrice - pPrice) / pPrice) * 100 : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Please enter a valid product name.");
      return;
    }

    const parsedPurchase = parseFloat(formData.purchasePrice);
    const parsedSelling = parseFloat(formData.sellingPrice);

    if (isNaN(parsedPurchase) || parsedPurchase < 0) {
      setError("Please enter a valid non-negative purchase price.");
      return;
    }
    if (isNaN(parsedSelling) || parsedSelling < 0) {
      setError("Please enter a valid non-negative selling price.");
      return;
    }
    if (parsedSelling < parsedPurchase) {
      const confirmBelowCost = window.confirm(
        `Warning: Selling price (₹${parsedSelling}) is lower than wholesale purchase price (₹${parsedPurchase}). You will incur a loss of ₹${(parsedPurchase - parsedSelling).toFixed(2)} per unit. Do you still want to save?`
      );
      if (!confirmBelowCost) return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        ...formData,
        name: formData.name.trim(),
        stock: Math.max(0, parseInt(formData.stock, 10) || 0),
        purchasePrice: parsedPurchase,
        purchaseCost: parsedPurchase,
        sellingPrice: parsedSelling,
        mrp: parsedSelling,
        dailySales: Math.max(0, parseFloat(formData.dailySales) || 0),
        leadTime: Math.max(1, parseInt(formData.leadTime, 10) || 2),
        safetyStock: Math.max(0, parseInt(formData.safetyStock, 10) || 5),
        minStockLevel: Math.max(0, parseInt(formData.safetyStock, 10) || 5)
      };

      await onSave(payload, initialData?._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-50/70 border-b border-emerald-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-sm">
              <PackagePlus size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {initialData ? "Edit FMCG Product & Pricing" : "Add New FMCG Product"}
              </h2>
              <p className="text-xs text-slate-500">Configure catalog details, custom purchase price and retail selling price</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Parle-G Gold Biscuits (70g)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Name</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Parle, Nestle, Tata, HUL"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Purchase Price (Wholesale Cost) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Purchase Price (₹ Wholesale Cost) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  name="purchasePrice"
                  min="0"
                  step="0.01"
                  required
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  placeholder="e.g. 8.50"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Custom rate paid to distributor per unit</span>
            </div>

            {/* Selling Price (Retail MRP) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Selling Price (₹ Retail MRP) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  name="sellingPrice"
                  min="0"
                  step="0.01"
                  required
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  placeholder="e.g. 10.00"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Price charged to customer at counter</span>
            </div>

            {/* LIVE PROFIT MARGIN PREVIEW CARD */}
            <div className="md:col-span-2 p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <TrendingUp size={15} className="text-emerald-700" />
                  Live Profit Margin Preview
                </span>
                {profitPerUnit < 0 ? (
                  <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md flex items-center gap-1 border border-red-200">
                    <AlertTriangle size={12} /> Loss: Selling Below Cost
                  </span>
                ) : profitMarginPercent >= 20 ? (
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200">
                    <CheckCircle2 size={12} /> High Margin Item
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">
                    Standard Retail Margin
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">Profit per Unit</span>
                  <span className={`text-sm font-black ${profitPerUnit >= 0 ? "text-emerald-800" : "text-red-600"}`}>
                    ₹{profitPerUnit.toFixed(2)}
                  </span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">Profit Margin (%)</span>
                  <span className={`text-sm font-black ${profitMarginPercent >= 0 ? "text-emerald-800" : "text-red-600"}`}>
                    {profitMarginPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">Markup on Cost</span>
                  <span className={`text-sm font-black ${markupPercent >= 0 ? "text-teal-800" : "text-red-600"}`}>
                    +{markupPercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Current Stock */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Shelf Stock <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="stock"
                  min="0"
                  step="1"
                  required
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-2/3 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-1/3 px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  {UNITS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Safety Stock / Minimum Stock Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Minimum Stock Level (Safety Buffer)
              </label>
              <input
                type="number"
                name="safetyStock"
                min="0"
                step="1"
                value={formData.safetyStock}
                onChange={handleChange}
                placeholder="e.g. 10"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Daily Sales Velocity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Avg. Daily Sales Velocity (units/day)
              </label>
              <input
                type="number"
                name="dailySales"
                min="0"
                step="0.1"
                value={formData.dailySales}
                onChange={handleChange}
                placeholder="e.g. 8"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Supplier Lead Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Distributor Lead Time (Days)
              </label>
              <input
                type="number"
                name="leadTime"
                min="1"
                step="1"
                value={formData.leadTime}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Supplier</label>
              <select
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                {suppliers.length > 0 ? (
                  suppliers.map(s => (
                    <option key={s._id || s.name} value={s.name}>{s.name}</option>
                  ))
                ) : (
                  <>
                    <option value="Shree Ram FMCG Distributors">Shree Ram FMCG Distributors</option>
                    <option value="Metro Rural Logistics & Wholesale">Metro Rural Logistics & Wholesale</option>
                    <option value="Hindustan Consumer Supply Co.">Hindustan Consumer Supply Co.</option>
                    <option value="Balaji Agencies & Spices Hub">Balaji Agencies & Spices Hub</option>
                  </>
                )}
              </select>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Expiry Date</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <PackagePlus size={16} />
              <span>{submitting ? "Saving..." : initialData ? "Update Product & Pricing" : "Add to Inventory"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
