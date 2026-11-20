import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ProductModal from "./ProductModal";
import SaleModal from "./SaleModal";
import OrderModal from "./OrderModal";
import api from "../api";

export default function DashboardLayout({ children, title, subtitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [prefillOrderItem, setPrefillOrderItem] = useState(null);

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const loadData = async () => {
    try {
      const [prodsRes, supsRes, sumRes, healthRes] = await Promise.all([
        api.get("/products"),
        api.get("/suppliers"),
        api.get("/inventory/summary"),
        api.get("/health").catch(() => ({ data: { database: "in-memory (demo)" } }))
      ]);

      setProducts(prodsRes.data);
      setSuppliers(supsRes.data);
      setSummary(sumRes.data);
      setSystemStatus(healthRes.data);
    } catch (err) {
      console.warn("Failed to load initial layout data:", err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProduct = async (productData, id) => {
    if (id) {
      await api.put(`/products/${id}`, productData);
      showToast(`Updated product: ${productData.name}`);
    } else {
      await api.post("/products", productData);
      showToast(`Added product: ${productData.name}`);
    }
    loadData();
  };

  const handleRecordSale = async (saleData) => {
    const res = await api.post("/sales", saleData);
    showToast(`Sale recorded! Stock updated for ${res.data?.sale?.productName}`);
    loadData();
  };

  const handleCreateOrder = async (orderData) => {
    const res = await api.post("/orders", orderData);
    showToast(`Purchase order ${res.data?.poNumber || ""} sent to distributor!`);
    loadData();
  };

  const handleOpenOrderWithItem = (item) => {
    setPrefillOrderItem(item);
    setOrderModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] flex text-slate-800">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        systemStatus={systemStatus}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={title}
          subtitle={subtitle}
          onOpenSale={() => setSaleModalOpen(true)}
          onOpenProduct={() => setProductModalOpen(true)}
          onOpenOrder={() => {
            setPrefillOrderItem(null);
            setOrderModalOpen(true);
          }}
          lowStockCount={summary?.lowStock || 0}
        />

        {/* Toast alert banner */}
        {toastMessage && (
          <div className="mx-4 md:mx-8 mt-3 p-3.5 bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-700/20 flex items-center justify-between animate-fade-in">
            <span>✓ {toastMessage}</span>
            <button onClick={() => setToastMessage("")} className="text-emerald-200 hover:text-white">✕</button>
          </div>
        )}

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {/* Clone children and inject helper props if functional */}
          {React.isValidElement(children)
            ? React.cloneElement(children, {
                products,
                suppliers,
                summary,
                systemStatus,
                onRefresh: loadData,
                onOpenSaleModal: () => setSaleModalOpen(true),
                onOpenProductModal: () => setProductModalOpen(true),
                onOpenOrderModal: handleOpenOrderWithItem,
                showToast
              })
            : children}
        </main>
      </div>

      {/* Global Modals */}
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSave={handleSaveProduct}
        suppliers={suppliers}
      />

      <SaleModal
        isOpen={saleModalOpen}
        onClose={() => setSaleModalOpen(false)}
        onSave={handleRecordSale}
        products={products}
      />

      <OrderModal
        isOpen={orderModalOpen}
        onClose={() => {
          setOrderModalOpen(false);
          setPrefillOrderItem(null);
        }}
        onSave={handleCreateOrder}
        prefillItem={prefillOrderItem}
        products={products}
        suppliers={suppliers}
      />
    </div>
  );
}
