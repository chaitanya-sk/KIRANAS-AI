import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import {
  Store,
  Product,
  Category,
  Inventory,
  Sale,
  Supplier,
  PurchaseOrder,
  Forecast,
  StockAlert,
  DeadStock,
  Logistics,
  Customer,
  Transaction,
  Promotion
} from "../models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");

// Cache for JSON fallback mode
const fileCache = new Map();

function getCachedData(filename) {
  if (!fileCache.has(filename)) {
    const filePath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filePath)) {
      fileCache.set(filename, JSON.parse(fs.readFileSync(filePath, "utf-8")));
    } else {
      fileCache.set(filename, []);
    }
  }
  return fileCache.get(filename);
}

// In-memory query helper for pagination, filtering, searching and sorting
function paginateAndFilter(items, req, { searchFields = ["name"], defaultSort = "createdAt" } = {}) {
  let filtered = [...items];
  const {
    page = 1,
    limit = 20,
    search = "",
    q = "",
    storeId,
    productId,
    category,
    status,
    startDate,
    endDate,
    sortBy = defaultSort,
    sortOrder = "desc"
  } = req.query;

  const searchQuery = (search || q).toLowerCase().trim();

  // 1. Text Search
  if (searchQuery) {
    filtered = filtered.filter(item => {
      return searchFields.some(field => {
        const val = item[field];
        return val && String(val).toLowerCase().includes(searchQuery);
      });
    });
  }

  // 2. Specific field filters
  if (storeId) {
    filtered = filtered.filter(item => item.storeId === storeId);
  }
  if (productId) {
    filtered = filtered.filter(item => item.productId === productId);
  }
  if (category) {
    filtered = filtered.filter(item => item.category && item.category.toLowerCase() === category.toLowerCase());
  }
  if (status) {
    filtered = filtered.filter(item => {
      const itemStatus = item.status || item.orderStatus || item.stockStatus || item.storeStatus || item.alertStatus;
      return itemStatus && itemStatus.toLowerCase() === status.toLowerCase();
    });
  }

  // 3. Date range filter
  if (startDate || endDate) {
    filtered = filtered.filter(item => {
      const dateVal = item.saleDate || item.orderDate || item.transactionDate || item.dispatchDate || item.createdDate;
      if (!dateVal) return true;
      if (startDate && dateVal < startDate) return false;
      if (endDate && dateVal > endDate) return false;
      return true;
    });
  }

  // 4. Sorting
  filtered.sort((a, b) => {
    const valA = a[sortBy] !== undefined ? a[sortBy] : "";
    const valB = b[sortBy] !== undefined ? b[sortBy] : "";
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // 5. Pagination
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));
  const total = filtered.length;
  const totalPages = Math.ceil(total / limitNum);
  const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return {
    data: paginated,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1
    }
  };
}

// Controller Methods
export const getStores = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (req.query.storeId) query.storeId = req.query.storeId;
      if (req.query.status) query.storeStatus = req.query.status;
      if (req.query.search) query.storeName = { $regex: req.query.search, $options: "i" };

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const total = await Store.countDocuments(query);
      const data = await Store.find(query).skip((page - 1) * limit).limit(limit).lean();

      return res.json({ data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
    }
    const result = paginateAndFilter(getCachedData("stores.json"), req, { searchFields: ["storeName", "village", "district", "ownerName"] });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stores", error: err.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (req.query.category) query.category = req.query.category;
      if (req.query.supplierId) query.supplierId = req.query.supplierId;
      if (req.query.search) {
        query.$or = [
          { name: { $regex: req.query.search, $options: "i" } },
          { brand: { $regex: req.query.search, $options: "i" } },
          { sku: { $regex: req.query.search, $options: "i" } }
        ];
      }
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const total = await Product.countDocuments(query);
      const data = await Product.find(query).skip((page - 1) * limit).limit(limit).lean();

      return res.json({ data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
    }
    const result = paginateAndFilter(getCachedData("products.json"), req, { searchFields: ["name", "brand", "sku", "category"] });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const data = await Category.find().lean();
      return res.json({ data, count: data.length });
    }
    const data = getCachedData("categories.json");
    res.json({ data, count: data.length });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch categories", error: err.message });
  }
};

export const getInventory = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (req.query.storeId) query.storeId = req.query.storeId;
      if (req.query.productId) query.productId = req.query.productId;
      if (req.query.status) query.stockStatus = req.query.status;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const total = await Inventory.countDocuments(query);
      const data = await Inventory.find(query).skip((page - 1) * limit).limit(limit).lean();

      return res.json({ data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
    }
    const result = paginateAndFilter(getCachedData("inventory.json"), req, { searchFields: ["productName", "sku", "stockStatus"] });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch inventory", error: err.message });
  }
};

export const getSales = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (req.query.storeId) query.storeId = req.query.storeId;
      if (req.query.productId) query.productId = req.query.productId;
      if (req.query.startDate || req.query.endDate) {
        query.saleDate = {};
        if (req.query.startDate) query.saleDate.$gte = req.query.startDate;
        if (req.query.endDate) query.saleDate.$lte = req.query.endDate;
      }
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const total = await Sale.countDocuments(query);
      const data = await Sale.find(query).sort({ saleDate: -1 }).skip((page - 1) * limit).limit(limit).lean();

      return res.json({ data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
    }
    const result = paginateAndFilter(getCachedData("sales.json"), req, { searchFields: ["productName", "sku", "invoiceNumber", "customerName"], defaultSort: "saleDate" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sales", error: err.message });
  }
};

export const getSuppliers = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (req.query.district) query.district = req.query.district;
      if (req.query.status) query.status = req.query.status;
      const data = await Supplier.find(query).lean();
      return res.json({ data, count: data.length });
    }
    const result = paginateAndFilter(getCachedData("suppliers.json"), req, { searchFields: ["name", "contactPerson", "district"] });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch suppliers", error: err.message });
  }
};

export const getPurchaseOrders = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (req.query.storeId) query.storeId = req.query.storeId;
      if (req.query.supplierId) query.supplierId = req.query.supplierId;
      if (req.query.status) query.orderStatus = req.query.status;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const total = await PurchaseOrder.countDocuments(query);
      const data = await PurchaseOrder.find(query).sort({ orderDate: -1 }).skip((page - 1) * limit).limit(limit).lean();

      return res.json({ data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
    }
    const result = paginateAndFilter(getCachedData("purchaseOrders.json"), req, { searchFields: ["poNumber", "supplierName", "orderStatus"], defaultSort: "orderDate" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch purchase orders", error: err.message });
  }
};

export const getForecasts = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (req.query.storeId) query.storeId = req.query.storeId;
      if (req.query.productId) query.productId = req.query.productId;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const total = await Forecast.countDocuments(query);
      const data = await Forecast.find(query).skip((page - 1) * limit).limit(limit).lean();

      return res.json({ data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
    }
    const result = paginateAndFilter(getCachedData("forecasts.json"), req, { searchFields: ["productName", "sku", "demandTrend"] });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch demand forecasts", error: err.message });
  }
};

export const getAlerts = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (req.query.storeId) query.storeId = req.query.storeId;
      if (req.query.severity) query.severity = req.query.severity;
      if (req.query.type) query.alertType = req.query.type;

      const data = await StockAlert.find(query).sort({ severity: -1 }).lean();
      return res.json({ data, count: data.length });
    }
    const result = paginateAndFilter(getCachedData("stockAlerts.json"), req, { searchFields: ["productName", "alertType", "description"] });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stock alerts", error: err.message });
  }
};

export const getDeadStock = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (req.query.storeId) query.storeId = req.query.storeId;
      if (req.query.risk) query.deadStockRisk = req.query.risk;

      const data = await DeadStock.find(query).sort({ estimatedBlockedCapital: -1 }).lean();
      const totalBlockedCapital = data.reduce((sum, item) => sum + item.estimatedBlockedCapital, 0);

      return res.json({ totalBlockedCapital, count: data.length, data });
    }
    const items = getCachedData("deadStock.json");
    const result = paginateAndFilter(items, req, { searchFields: ["productName", "category", "sku"] });
    const totalBlockedCapital = items.reduce((sum, item) => sum + (item.estimatedBlockedCapital || 0), 0);
    res.json({ totalBlockedCapital, ...result });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch dead stock", error: err.message });
  }
};

export const getLogistics = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (req.query.storeId) query.storeId = req.query.storeId;
      if (req.query.status) query.deliveryStatus = req.query.status;

      const data = await Logistics.find(query).sort({ dispatchDate: -1 }).lean();
      return res.json({ data, count: data.length });
    }
    const result = paginateAndFilter(getCachedData("logistics.json"), req, { searchFields: ["driverReference", "vehicleType", "deliveryStatus"] });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch logistics", error: err.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (req.query.storeId) query.storeId = req.query.storeId;
      const data = await Customer.find(query).lean();
      return res.json({ data, count: data.length });
    }
    const result = paginateAndFilter(getCachedData("customers.json"), req, { searchFields: ["name", "village", "phone"] });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch customers", error: err.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (req.query.storeId) query.storeId = req.query.storeId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const total = await Transaction.countDocuments(query);
      const data = await Transaction.find(query).sort({ transactionDate: -1 }).skip((page - 1) * limit).limit(limit).lean();

      return res.json({ data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
    }
    const result = paginateAndFilter(getCachedData("transactions.json"), req, { searchFields: ["invoiceNumber", "customerName"], defaultSort: "transactionDate" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch transactions", error: err.message });
  }
};

export const getPromotions = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (req.query.storeId) query.storeId = req.query.storeId;
      if (req.query.status) query.status = req.query.status;
      const data = await Promotion.find(query).lean();
      return res.json({ data, count: data.length });
    }
    const result = paginateAndFilter(getCachedData("promotions.json"), req, { searchFields: ["title", "seasonalEvent"] });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch promotions", error: err.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const storeFilter = req.query.storeId ? { storeId: req.query.storeId } : {};

      const [
        totalProducts,
        totalStores,
        salesAgg,
        invAgg,
        deadStockAgg,
        pendingPOs
      ] = await Promise.all([
        Product.countDocuments(),
        Store.countDocuments(),
        Sale.aggregate([
          { $match: storeFilter },
          { $group: { _id: null, totalRevenue: { $sum: "$totalRevenue" }, totalProfit: { $sum: "$profit" }, count: { $sum: 1 } } }
        ]),
        Inventory.aggregate([
          { $match: storeFilter },
          { $group: {
            _id: null,
            totalVal: { $sum: "$stockValue" },
            lowStock: { $sum: { $cond: [{ $in: ["$stockStatus", ["Low Stock", "Critical", "Stocked Out"]] }, 1, 0] } },
            overstock: { $sum: { $cond: [{ $eq: ["$stockStatus", "Overstock"] }, 1, 0] } }
          }}
        ]),
        DeadStock.aggregate([
          { $match: storeFilter },
          { $group: { _id: null, totalBlocked: { $sum: "$estimatedBlockedCapital" }, count: { $sum: 1 } } }
        ]),
        PurchaseOrder.countDocuments({ ...storeFilter, orderStatus: { $in: ["Pending", "Confirmed", "In Transit"] } })
      ]);

      const salesData = salesAgg[0] || { totalRevenue: 0, totalProfit: 0, count: 0 };
      const invData = invAgg[0] || { totalVal: 0, lowStock: 0, overstock: 0 };
      const deadStockData = deadStockAgg[0] || { totalBlocked: 0, count: 0 };

      return res.json({
        totalProducts,
        totalStores,
        totalSalesRecords: salesData.count,
        totalRevenue: Math.round(salesData.totalRevenue),
        totalProfit: Math.round(salesData.totalProfit),
        totalInventoryValue: Math.round(invData.totalVal),
        lowStockProducts: invData.lowStock,
        overstockProducts: invData.overstock,
        deadStockValue: Math.round(deadStockData.totalBlocked),
        pendingPurchaseOrders: pendingPOs,
        avgDailySalesRevenue: Math.round(salesData.totalRevenue / 30),
        dataSource: "MongoDB Aggregations"
      });
    }

    // JSON Fallback
    const stats = getCachedData("dashboardStats.json");
    res.json({ ...stats, dataSource: "In-Memory Dataset Baseline" });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate dashboard statistics", error: err.message });
  }
};
