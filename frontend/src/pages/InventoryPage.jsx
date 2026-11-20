import React, { useState } from "react";
import {
  Boxes,
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  IndianRupee,
  ShoppingBag,
  Truck,
  Calendar,
  Layers,
  ArrowUpDown,
  Tag,
  CheckCircle2,
  X,
  TrendingUp
} from "lucide-react";
import api from "../api";
import ProductModal from "../components/ProductModal";

const CATEGORIES = [
  "All",
  "Biscuits & Snacks",
  "Instant Food",
  "Staples & Grains",
  "Cooking Oil & Ghee",
  "Personal Care",
  "Detergents & Cleaning",
  "Beverages & Tea",
  "Spices & Condiments"
];

const STATUS_FILTERS = ["All", "Critical", "Low Stock", "Healthy", "Dead Stock"];

export default function InventoryPage({
  products = [],
  suppliers = [],
  onRefresh,
  onOpenSaleModal,
  onOpenOrderModal,
  showToast
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [editProduct, setEditProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Quick Price Edit Modal State
  const [quickPriceProduct, setQuickPriceProduct] = useState(null);
  const [quickPurchasePrice, setQuickPurchasePrice] = useState("");
  const [quickSellingPrice, setQuickSellingPrice] = useState("");
  const [savingPrice, setSavingPrice] = useState(false);
  const [priceError, setPriceError] = useState("");

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Dead Stock" ? p.isDeadStock : p.status === selectedStatus);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditProduct(p);
    setIsModalOpen(true);
  };

  const handleOpenQuickPrice = (p) => {
    setQuickPriceProduct(p);
    setQuickPurchasePrice(p.purchasePrice !== undefined ? String(p.purchasePrice) : "0");
    setQuickSellingPrice(p.sellingPrice !== undefined ? String(p.sellingPrice) : "0");
    setPriceError("");
  };

  const handleSaveQuickPrice = async (e) => {
    e.preventDefault();
    if (!quickPriceProduct) return;

    const parsedPurchase = parseFloat(quickPurchasePrice);
    const parsedSelling = parseFloat(quickSellingPrice);

    if (isNaN(parsedPurchase) || parsedPurchase < 0) {
      setPriceError("Please enter a valid non-negative purchase price.");
      return;
    }
    if (isNaN(parsedSelling) || parsedSelling < 0) {
      setPriceError("Please enter a valid non-negative selling price.");
      return;
    }

    try {
      setSavingPrice(true);
      setPriceError("");

      await api.put(`/products/${quickPriceProduct._id}`, {
        purchasePrice: parsedPurchase,
        sellingPrice: parsedSelling
      });

      showToast?.(`Prices for "${quickPriceProduct.name}" updated to Cost: ₹${parsedPurchase.toFixed(2)}, MRP: ₹${parsedSelling.toFixed(2)}.`);
      setQuickPriceProduct(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      setPriceError(err.response?.data?.message || err.message || "Failed to update price.");
    } finally {
      setSavingPrice(false);
    }
  };

  const handleSaveProduct = async (productData, id) => {
    if (id) {
      await api.put(`/products/${id}`, productData);
      showToast?.(`Product "${productData.name}" updated successfully.`);
    } else {
      await api.post("/products", productData);
      showToast?.(`Product "${productData.name}" added to inventory.`);
    }
    if (onRefresh) onRefresh();
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from inventory?`)) {
      return;
    }
    try {
      setDeletingId(id);
      await api.delete(`/products/${id}`);
      showToast?.(`Deleted "${name}".`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Failed to delete product: " + (err.response?.data?.message || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  // Profit margin calculation for quick modal
  const modalPPrice = parseFloat(quickPurchasePrice) || 0;
  const modalSPrice = parseFloat(quickSellingPrice) || 0;
  const modalProfitPerUnit = modalSPrice - modalPPrice;
  const modalMarginPercent = modalSPrice > 0 ? ((modalSPrice - modalPPrice) / modalSPrice) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold text-emerald-700 tracking-wider uppercase">
            Product Catalog & Shelf Stock
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Inventory Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of {products.length} Indian FMCG products with full shopkeeper pricing control
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search FMCG products by name, brand, or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>Category: {cat}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              {STATUS_FILTERS.map(st => (
                <option key={st} value={st}>Status: {st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Category Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Quick:</span>
          {CATEGORIES.slice(0, 6).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-3">Stock & Unit</th>
                <th className="py-3 px-3">Selling MRP / Cost</th>
                <th className="py-3 px-3">Profit Margin %</th>
                <th className="py-3 px-3">Daily Velocity</th>
                <th className="py-3 px-3">Stock Buffer</th>
                <th className="py-3 px-3">Supplier & Lead</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions & Pricing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                  const pCost = Number(p.purchasePrice !== undefined ? p.purchasePrice : (p.purchaseCost || 0));
                  const pSell = Number(p.sellingPrice !== undefined ? p.sellingPrice : (p.mrp || 0));
                  // Formula: ((sellingPrice - purchasePrice) / sellingPrice) * 100
                  const marginPct = pSell > 0 ? Math.round(((pSell - pCost) / pSell) * 100) : 0;

                  return (
                    <tr key={p._id} className="hover:bg-emerald-50/40 transition">
                      {/* Name & Category */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{p.category}</span>
                          {p.brand && <span>· Brand: {p.brand}</span>}
                          {p.sku && <span>· {p.sku}</span>}
                        </div>
                      </td>

                      {/* Stock & Unit */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-black text-sm ${p.stock <= (p.safetyStock || 5) ? "text-red-600" : "text-slate-800"}`}>
                            {p.stock}
                          </span>
                          <span className="text-[10px] text-slate-400">{p.unit || "units"}</span>
                        </div>
                        {p.stock <= 5 && (
                          <span className="text-[9px] text-red-600 font-bold block">Refill alert</span>
                        )}
                      </td>

                      {/* Selling MRP / Wholesale Cost */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 text-xs">
                          ₹{pSell.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">(MRP)</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Cost: <span className="font-bold text-slate-700">₹{pCost.toFixed(2)}</span>
                        </div>
                      </td>

                      {/* Margin % */}
                      <td className="py-3 px-3">
                        <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                          marginPct >= 20
                            ? "text-emerald-800 bg-emerald-50 border border-emerald-100"
                            : marginPct > 0
                            ? "text-teal-800 bg-teal-50 border border-teal-100"
                            : "text-red-700 bg-red-50 border border-red-100"
                        }`}>
                          {marginPct >= 0 ? `+${marginPct}%` : `${marginPct}%`}
                        </span>
                      </td>

                      {/* Daily Velocity */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{p.dailySales} /day</div>
                        <div className="text-[10px] text-slate-400">
                          {p.daysLeft ? `~${p.daysLeft}d left` : "No movement"}
                        </div>
                      </td>

                      {/* Stock Buffer */}
                      <td className="py-3 px-3">
                        <div className="text-[11px] text-slate-600">Safety: {p.safetyStock || 5} units</div>
                        <div className="text-[10px] text-slate-400">Min: {p.minStockLevel || 10} units</div>
                      </td>

                      {/* Supplier */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-700 truncate max-w-[130px]">{p.supplier || "Local Wholesale"}</div>
                        <div className="text-[10px] text-slate-400">Lead: {p.leadTime || 2} days</div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            p.status === "Critical"
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : p.status === "Low Stock"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : p.isDeadStock
                              ? "bg-slate-100 text-slate-700 border border-slate-300"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Price Edit Button */}
                          <button
                            onClick={() => handleOpenQuickPrice(p)}
                            title="Edit product price"
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-2xs"
                          >
                            <IndianRupee size={12} />
                            <span>Edit Price</span>
                          </button>

                          {/* Full Edit Modal */}
                          <button
                            onClick={() => handleOpenEdit(p)}
                            title="Edit full product details"
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Edit2 size={14} />
                          </button>

                          {/* Delete Product */}
                          <button
                            onClick={() => handleDeleteProduct(p._id, p.name)}
                            disabled={deletingId === p._id}
                            title="Delete product"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-40"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400 text-xs">
                    No products matched your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info in table */}
        <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredProducts.length} of {products.length} products</span>
          <span className="text-[11px]">All product prices persist directly to the database</span>
        </div>
      </div>

      {/* QUICK PRICE EDIT MODAL */}
      {quickPriceProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-50 to-teal-50/50 border-b border-emerald-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-sm">
                  <IndianRupee size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Edit Product Pricing</h3>
                  <p className="text-xs text-slate-500 truncate max-w-[240px]">{quickPriceProduct.name}</p>
                </div>
              </div>
              <button
                onClick={() => setQuickPriceProduct(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white/80 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveQuickPrice} className="p-5 space-y-4">
              {priceError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>{priceError}</span>
                </div>
              )}

              <div className="space-y-3">
                {/* Purchase Price (Wholesale Cost) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Purchase Price / Wholesale Cost (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={quickPurchasePrice}
                      onChange={(e) => setQuickPurchasePrice(e.target.value)}
                      placeholder="e.g. 8.50"
                      className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Rate paid to supplier per unit</span>
                </div>

                {/* Selling Price (Retail MRP) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Selling Price / Retail MRP (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={quickSellingPrice}
                      onChange={(e) => setQuickSellingPrice(e.target.value)}
                      placeholder="e.g. 10.00"
                      className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Price charged to customer</span>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Profit per Unit:</span>
                  <span className={`font-black ${modalProfitPerUnit >= 0 ? "text-emerald-800" : "text-red-600"}`}>
                    ₹{modalProfitPerUnit.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Profit Margin (%):</span>
                  <span className={`font-black ${modalMarginPercent >= 0 ? "text-emerald-800" : "text-red-600"}`}>
                    {modalMarginPercent.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickPriceProduct(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPrice}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>{savingPrice ? "Saving..." : "Save Prices to Database"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Add Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        initialData={editProduct}
        suppliers={suppliers}
      />
    </div>
  );
}
