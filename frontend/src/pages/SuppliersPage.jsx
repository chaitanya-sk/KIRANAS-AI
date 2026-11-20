import React, { useState } from "react";
import {
  Building2,
  Plus,
  Phone,
  Mail,
  MapPin,
  Clock,
  Layers,
  Edit2,
  Trash2,
  Truck,
  Star,
  ExternalLink
} from "lucide-react";
import api from "../api";
import SupplierModal from "../components/SupplierModal";

export default function SuppliersPage({
  suppliers = [],
  onRefresh,
  onOpenOrderModal,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleOpenAdd = () => {
    setEditSupplier(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s) => {
    setEditSupplier(s);
    setIsModalOpen(true);
  };

  const handleSaveSupplier = async (data, id) => {
    if (id) {
      await api.put(`/suppliers/${id}`, data);
      showToast?.(`Supplier "${data.name}" updated successfully.`);
    } else {
      await api.post("/suppliers", data);
      showToast?.(`Supplier "${data.name}" created.`);
    }
    if (onRefresh) onRefresh();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete distributor "${name}"?`)) return;
    try {
      setDeletingId(id);
      await api.delete(`/suppliers/${id}`);
      showToast?.(`Deleted distributor "${name}".`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Error deleting supplier: " + (err.response?.data?.message || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold text-emerald-700 tracking-wider uppercase flex items-center gap-1.5">
            <Building2 size={13} />
            Wholesale & Mandi Network
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            FMCG Distributor Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage rural depot delivery cycles, minimum order quantities (MOQs) and representative contacts
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
        >
          <Plus size={16} />
          <span>Add New Distributor</span>
        </button>
      </div>

      {/* Supplier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {suppliers.map(s => (
          <div
            key={s._id}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{s.name}</h3>
                    <div className="text-xs text-slate-500 font-medium">Rep: {s.contactPerson || "Sales Executive"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded-lg">
                  <Star size={13} fill="currentColor" />
                  <span>{s.rating || 4.5}</span>
                </div>
              </div>

              {/* Contact Pills */}
              <div className="grid grid-cols-2 gap-2 my-3 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100 truncate">
                  <Phone size={13} className="text-emerald-600 shrink-0" />
                  <span className="font-bold text-slate-800 truncate">{s.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100 truncate">
                  <Clock size={13} className="text-emerald-600 shrink-0" />
                  <span>Lead: <strong className="text-slate-800">{s.leadTimeDays || 2} Days</strong></span>
                </div>
              </div>

              {/* Address */}
              {s.address && (
                <div className="flex items-start gap-1.5 text-[11px] text-slate-500 mb-2">
                  <MapPin size={13} className="text-slate-400 mt-0.5 shrink-0" />
                  <span>{s.address}</span>
                </div>
              )}

              {/* Category Badges */}
              <div className="flex flex-wrap gap-1 mt-2">
                {(s.categories || ["Staples & Grains"]).map((cat, i) => (
                  <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100">
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                MOQ: <strong className="text-slate-700">{s.minOrderQuantity || 10} units</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenOrderModal({ supplier: s.name, leadTime: s.leadTimeDays })}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg transition flex items-center gap-1"
                >
                  <Truck size={13} />
                  <span>Create PO</span>
                </button>
                <button
                  onClick={() => handleOpenEdit(s)}
                  title="Edit supplier"
                  className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(s._id, s.name)}
                  disabled={deletingId === s._id}
                  title="Delete supplier"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-40"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <SupplierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSupplier}
        initialData={editSupplier}
      />
    </div>
  );
}
