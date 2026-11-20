import React, { useState, useEffect } from "react";
import { X, Building2, AlertCircle } from "lucide-react";

export default function SupplierModal({ isOpen, onClose, onSave, initialData = null }) {
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    leadTimeDays: 2,
    minOrderQuantity: 10,
    categories: "Biscuits & Snacks, Staples & Grains"
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        contactPerson: initialData.contactPerson || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        address: initialData.address || "",
        leadTimeDays: initialData.leadTimeDays ?? 2,
        minOrderQuantity: initialData.minOrderQuantity ?? 10,
        categories: Array.isArray(initialData.categories) ? initialData.categories.join(", ") : "Biscuits & Snacks"
      });
    } else {
      setFormData({
        name: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
        leadTimeDays: 2,
        minOrderQuantity: 10,
        categories: "Biscuits & Snacks, Staples & Grains"
      });
    }
    setError("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setError("Distributor name and phone number are required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const categoriesArray = formData.categories
        .split(",")
        .map(c => c.trim())
        .filter(Boolean);

      await onSave({
        ...formData,
        categories: categoriesArray
      }, initialData?._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save supplier.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-50/70 border-b border-emerald-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-lg">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {initialData ? "Edit FMCG Distributor" : "Add FMCG Distributor"}
              </h2>
              <p className="text-xs text-slate-500">Manage delivery cycles, MOQs and contact details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Distributor Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Shree Ram FMCG Wholesale"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person Name</label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="e.g. Rajesh Agrawal"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +91 98260 11223"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Optional)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. agency@gmail.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Time (Days)</label>
              <input
                type="number"
                name="leadTimeDays"
                min="1"
                value={formData.leadTimeDays}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Order Qty (MOQ)</label>
              <input
                type="number"
                name="minOrderQuantity"
                min="1"
                value={formData.minOrderQuantity}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product Categories Supplied</label>
              <input
                type="text"
                name="categories"
                value={formData.categories}
                onChange={handleChange}
                placeholder="e.g. Biscuits & Snacks, Instant Food, Personal Care"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Godown / Depot Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. Godown 4, APMC Mandi Yard, Dist. Mandi"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
            >
              {submitting ? "Saving..." : initialData ? "Update Distributor" : "Save Distributor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
