import React, { useState, useEffect } from "react";
import { X, ShoppingCart, IndianRupee, AlertCircle } from "lucide-react";

export default function SaleModal({ isOpen, onClose, onSave, products = [] }) {
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [customerName, setCustomerName] = useState("Counter Customer");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0]._id);
    }
    setQuantity(1);
    setError("");
  }, [isOpen, products, selectedProductId]);

  if (!isOpen) return null;

  const currentProduct = products.find(p => String(p._id) === String(selectedProductId));
  const subtotal = currentProduct ? (currentProduct.sellingPrice * (Number(quantity) || 0)) : 0;
  const isOutOfStock = currentProduct && currentProduct.stock <= 0;
  const isInsufficient = currentProduct && Number(quantity) > currentProduct.stock;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      setError("Please select a product.");
      return;
    }
    if (!quantity || quantity <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }
    if (isInsufficient) {
      setError(`Cannot sell ${quantity} units. Only ${currentProduct?.stock} in stock.`);
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await onSave({
        productId: selectedProductId,
        quantity: Number(quantity),
        paymentMethod,
        customerName: customerName.trim() || "Walk-in Customer"
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to record sale.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-50/70 border-b border-emerald-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-lg">
              <ShoppingCart size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Record Counter Sale</h2>
              <p className="text-xs text-slate-500">Instantly update shelf stock & AI sales velocity</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition">
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

          {/* Product Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Product <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              {products.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name} — ₹{p.sellingPrice} (Stock: {p.stock})
                </option>
              ))}
            </select>
          </div>

          {/* Stock info pill */}
          {currentProduct && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-600">Available Stock:</span>
              <span className={`font-bold px-2 py-0.5 rounded-full ${currentProduct.stock <= 5 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"}`}>
                {currentProduct.stock} {currentProduct.unit || "units"}
              </span>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantity Sold <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max={currentProduct?.stock || 999}
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {["Cash", "UPI", "Khata"].map(method => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition ${
                    paymentMethod === method
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {method === "Cash" ? "💵 Cash" : method === "UPI" ? "📱 UPI / QR" : "📒 Khata / Credit"}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name (Optional)</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Ramesh Patel, Walk-in"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Bill Calculation Box */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Total Bill Amount:</span>
            <span className="text-xl font-black text-emerald-800 flex items-center">
              <IndianRupee size={18} />
              {subtotal.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Buttons */}
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
              disabled={submitting || isOutOfStock || isInsufficient}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
            >
              {submitting ? "Processing..." : "Complete Sale & Restock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
