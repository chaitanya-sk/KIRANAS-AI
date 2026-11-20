import React, { useState, useEffect } from "react";
import { X, Truck, IndianRupee, AlertCircle, Plus, Trash2, Edit3, Calculator } from "lucide-react";

export default function OrderModal({ isOpen, onClose, onSave, prefillItem = null, products = [], suppliers = [] }) {
  const [supplier, setSupplier] = useState("");
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("In 2-3 business days");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (prefillItem) {
      setSupplier(prefillItem.supplier || suppliers[0]?.name || "Shree Ram FMCG Distributors");
      setItems([
        {
          productId: prefillItem._id,
          productName: prefillItem.name,
          sku: prefillItem.sku || "",
          quantity: prefillItem.reorderQty || 20,
          unitPrice: prefillItem.purchasePrice !== undefined ? prefillItem.purchasePrice : 10
        }
      ]);
    } else if (products.length > 0) {
      setSupplier(suppliers[0]?.name || "Shree Ram FMCG Distributors");
      setItems([
        {
          productId: products[0]._id,
          productName: products[0].name,
          sku: products[0].sku || "",
          quantity: 25,
          unitPrice: products[0].purchasePrice !== undefined ? products[0].purchasePrice : 10
        }
      ]);
    }
    setError("");
  }, [isOpen, prefillItem, products, suppliers]);

  if (!isOpen) return null;

  const handleItemChange = (index, field, value) => {
    setItems(prev => {
      const next = [...prev];
      if (field === "productId") {
        const prod = products.find(p => p._id === value);
        next[index] = {
          ...next[index],
          productId: value,
          productName: prod?.name || "",
          sku: prod?.sku || "",
          unitPrice: prod?.purchasePrice !== undefined ? prod.purchasePrice : 0
        };
      } else if (field === "quantity") {
        // Keep as string or sanitized number during typing
        next[index] = {
          ...next[index],
          quantity: value === "" ? "" : Math.max(1, parseInt(value, 10) || 1)
        };
      } else if (field === "unitPrice") {
        // Allow decimal typing
        next[index] = {
          ...next[index],
          unitPrice: value === "" ? "" : value
        };
      } else {
        next[index] = {
          ...next[index],
          [field]: value
        };
      }
      return next;
    });
  };

  const addItemRow = () => {
    if (products.length === 0) return;
    setItems(prev => [
      ...prev,
      {
        productId: products[0]._id,
        productName: products[0].name,
        sku: products[0].sku || "",
        quantity: 20,
        unitPrice: products[0].purchasePrice !== undefined ? products[0].purchasePrice : 10
      }
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Grand Total calculation = Sum of all item totals
  const grandTotal = items.reduce((acc, it) => {
    const qty = Number(it.quantity) || 0;
    const price = Number(it.unitPrice) || 0;
    return acc + (qty * price);
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplier) {
      setError("Please select a distributor.");
      return;
    }
    if (items.length === 0) {
      setError("Order must contain at least one product.");
      return;
    }

    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const qty = Number(it.quantity);
      const price = Number(it.unitPrice);
      if (!it.productId) {
        setError(`Please select a valid product for item #${i + 1}.`);
        return;
      }
      if (isNaN(qty) || qty <= 0) {
        setError(`Please enter a valid quantity greater than 0 for "${it.productName || 'Item ' + (i + 1)}".`);
        return;
      }
      if (isNaN(price) || price < 0) {
        setError(`Unit price cannot be negative for "${it.productName || 'Item ' + (i + 1)}".`);
        return;
      }
    }

    try {
      setSubmitting(true);
      setError("");

      const sanitizedItems = items.map(it => {
        const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
        const unitPrice = Math.max(0, parseFloat(it.unitPrice) || 0);
        return {
          productId: it.productId,
          productName: it.productName,
          sku: it.sku || "",
          quantity: qty,
          unitPrice: unitPrice,
          total: parseFloat((qty * unitPrice).toFixed(2))
        };
      });

      await onSave({
        supplier,
        items: sanitizedItems,
        total: parseFloat(grandTotal.toFixed(2)),
        notes,
        expectedDelivery
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create purchase order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50/50 border-b border-emerald-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-sm shadow-emerald-600/30">
              <Truck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800">Generate Purchase Order (PO)</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Edit3 size={10} /> Editable Unit Prices
                </span>
              </div>
              <p className="text-xs text-slate-500">Replenish FMCG stock with shopkeeper-controlled wholesale purchase pricing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white/80 rounded-xl transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Supplier & Delivery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Distributor / Supplier <span className="text-red-500">*</span>
              </label>
              <select
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                {suppliers.length > 0 ? (
                  suppliers.map(s => (
                    <option key={s._id || s.name} value={s.name}>
                      {s.name} ({s.leadTimeDays || 2}d lead time)
                    </option>
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Delivery Cycle</label>
              <input
                type="text"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
                placeholder="e.g. Tomorrow by 2 PM, In 2 days"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Order Items Table Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Order Items</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-bold border border-emerald-100">
                    {items.length} {items.length === 1 ? "product" : "products"}
                  </span>
                </label>
                <p className="text-[11px] text-slate-500">
                  Manually adjust quantity and wholesale purchase price per unit
                </p>
              </div>
              <button
                type="button"
                onClick={addItemRow}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 px-3 py-1.5 rounded-lg transition"
              >
                <Plus size={14} /> Add Another Item
              </button>
            </div>

            {/* Table Header */}
            <div className="bg-slate-100/80 rounded-xl p-2.5 grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <div className="col-span-5 sm:col-span-5">Product Name</div>
              <div className="col-span-2 sm:col-span-2 text-center">Quantity</div>
              <div className="col-span-3 sm:col-span-3 text-right">Unit Price (₹)</div>
              <div className="col-span-2 sm:col-span-2 text-right">Total Price (₹)</div>
            </div>

            {/* Table Rows */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {items.map((item, idx) => {
                const itemQty = Number(item.quantity) || 0;
                const itemPrice = Number(item.unitPrice) || 0;
                const itemTotal = (itemQty * itemPrice);

                return (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 items-center p-2.5 bg-white hover:bg-emerald-50/30 rounded-xl border border-slate-200 transition"
                  >
                    {/* Product Name Selector */}
                    <div className="col-span-5 sm:col-span-5">
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        {products.map(p => (
                          <option key={p._id} value={p._id}>
                            {p.name} (Stock: {p.stock})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity (Editable) */}
                    <div className="col-span-2 sm:col-span-2">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Unit Purchase Price (Editable) */}
                    <div className="col-span-3 sm:col-span-3">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                          className="w-full pl-6 pr-2 py-1.5 bg-white border border-emerald-200/90 rounded-lg text-xs font-black text-slate-900 text-right focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-emerald-50/20"
                        />
                      </div>
                    </div>

                    {/* Total Item Price (Automatic) & Action */}
                    <div className="col-span-2 sm:col-span-2 flex items-center justify-end gap-1.5">
                      <div className="text-right">
                        <div className="text-xs font-black text-emerald-800">
                          ₹{itemTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                          title="Remove item"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logistics Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Logistics / Delivery Note</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Deliver via Morning Mandi Mini-truck, payment on delivery"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Grand Total Bar */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator size={18} className="text-emerald-700" />
              <div>
                <span className="text-xs font-bold text-slate-800 block">Total Purchase Order Value:</span>
                <span className="text-[10px] text-slate-500">Sum of all item totals with customized pricing</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-800 flex items-center justify-end">
                <IndianRupee size={20} className="shrink-0" />
                {grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
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
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 transition disabled:opacity-50 flex items-center gap-2"
            >
              <Truck size={16} />
              <span>{submitting ? "Placing Order..." : "Confirm & Send Purchase Order"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
