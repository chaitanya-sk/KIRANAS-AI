import express from "express";
import {
  getStores,
  getProducts,
  getCategories,
  getInventory,
  getSales,
  getSuppliers,
  getPurchaseOrders,
  getForecasts,
  getAlerts,
  getDeadStock,
  getLogistics,
  getCustomers,
  getTransactions,
  getPromotions,
  getDashboardStats
} from "../controllers/datasetController.js";

const router = express.Router();

// GET /api/dataset/stores
router.get("/stores", getStores);

// GET /api/dataset/products
router.get("/products", getProducts);

// GET /api/dataset/categories
router.get("/categories", getCategories);

// GET /api/dataset/inventory
router.get("/inventory", getInventory);

// GET /api/dataset/sales
router.get("/sales", getSales);

// GET /api/dataset/suppliers
router.get("/suppliers", getSuppliers);

// GET /api/dataset/purchase-orders
router.get("/purchase-orders", getPurchaseOrders);

// GET /api/dataset/forecasts
router.get("/forecasts", getForecasts);

// GET /api/dataset/alerts
router.get("/alerts", getAlerts);

// GET /api/dataset/dead-stock
router.get("/dead-stock", getDeadStock);

// GET /api/dataset/logistics
router.get("/logistics", getLogistics);

// GET /api/dataset/customers
router.get("/customers", getCustomers);

// GET /api/dataset/transactions
router.get("/transactions", getTransactions);

// GET /api/dataset/promotions
router.get("/promotions", getPromotions);

// GET /api/dataset/dashboard-stats
router.get("/dashboard-stats", getDashboardStats);

export default router;
