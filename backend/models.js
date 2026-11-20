// Re-export all models from modular models directory for backward compatibility
export {
  User,
  Store,
  Product,
  Category,
  Inventory,
  Sale,
  Supplier,
  PurchaseOrder,
  PurchaseOrder as Order, // Alias for legacy code
  Forecast,
  StockAlert,
  DeadStock,
  Logistics,
  Customer,
  Transaction,
  Promotion
} from "./models/index.js";
