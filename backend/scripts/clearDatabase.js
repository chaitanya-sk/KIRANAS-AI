import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
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
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function clearDatabase() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/kiranas";
  console.log("==================================================");
  console.log("🧹 KIRANAS DATABASE DATASET CLEANER");
  console.log("Target URI:", mongoUri);
  console.log("Note: User accounts and authentication credentials are preserved.");
  console.log("==================================================");

  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("✓ Connected to MongoDB successfully.\n");

    const modelsToClear = [
      { name: "Stores", model: Store },
      { name: "Products", model: Product },
      { name: "Categories", model: Category },
      { name: "Inventory", model: Inventory },
      { name: "Sales", model: Sale },
      { name: "Suppliers", model: Supplier },
      { name: "PurchaseOrders", model: PurchaseOrder },
      { name: "Forecasts", model: Forecast },
      { name: "StockAlerts", model: StockAlert },
      { name: "DeadStock", model: DeadStock },
      { name: "Logistics", model: Logistics },
      { name: "Customers", model: Customer },
      { name: "Transactions", model: Transaction },
      { name: "Promotions", model: Promotion }
    ];

    for (const { name, model } of modelsToClear) {
      const res = await model.deleteMany({});
      console.log(`✓ Cleared ${name}: ${res.deletedCount} records removed.`);
    }

    console.log("\n✅ Dataset collections cleared successfully. (Users preserved)");
  } catch (err) {
    console.error("❌ Clear Database Error:", err.message);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

clearDatabase();
