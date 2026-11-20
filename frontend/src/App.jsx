import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Pages
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
import PredictionsPage from "./pages/PredictionsPage";
import DeadStockPage from "./pages/DeadStockPage";
import OrdersPage from "./pages/OrdersPage";
import SuppliersPage from "./pages/SuppliersPage";
import SalesPage from "./pages/SalesPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OAuthCallback from "./pages/OAuthCallback";

// Layout
import DashboardLayout from "./components/DashboardLayout";
import AIChatbot from "./components/AIChatbot";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Authentication */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />

        {/* Retailer Dashboard Portal with Dedicated DashboardLayout */}
        <Route
          path="/dashboard"
          element={
            <DashboardLayout title="Retailer Dashboard" subtitle="Store overview, real-time analytics & telemetry">
              <DashboardPage />
            </DashboardLayout>
          }
        />

        <Route
          path="/inventory"
          element={
            <DashboardLayout title="Inventory Catalog" subtitle="Shelf stock, prices, velocity & category filters">
              <InventoryPage />
            </DashboardLayout>
          }
        />

        <Route
          path="/predictions"
          element={
            <DashboardLayout title="AI Demand Forecast" subtitle="Mathematical reorder points, lead times & stockout dates">
              <PredictionsPage />
            </DashboardLayout>
          }
        />

        <Route
          path="/dead-stock"
          element={
            <DashboardLayout title="Dead Stock Sentinel" subtitle="Working capital unblocking & clearance discount planner">
              <DeadStockPage />
            </DashboardLayout>
          }
        />

        <Route
          path="/orders"
          element={
            <DashboardLayout title="Smart Reorders & POs" subtitle="Automated purchase quantities & distributor delivery tracking">
              <OrdersPage />
            </DashboardLayout>
          }
        />

        <Route
          path="/suppliers"
          element={
            <DashboardLayout title="FMCG Distributors" subtitle="Wholesale depots, lead times, MOQs & contact directory">
              <SuppliersPage />
            </DashboardLayout>
          }
        />

        <Route
          path="/sales"
          element={
            <DashboardLayout title="Counter POS Register" subtitle="Record customer sales, deduct stock & track daily cashflow">
              <SalesPage />
            </DashboardLayout>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating KIRANAS AI Assistant */}
      <AIChatbot />
    </AuthProvider>
    </ErrorBoundary>
  );
}
