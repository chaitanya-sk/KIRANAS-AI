import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import {
  User,
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

const DATA_DIR = path.join(__dirname, "..", "data");

function loadData(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Data file not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

async function seedDatabase() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/kiranas";
  console.log("==================================================");
  console.log("🌱 KIRANAS MONGODB DATASET SEEDER");
  console.log("Target URI:", mongoUri);
  console.log("==================================================");

  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("✓ Connected to MongoDB successfully.\n");

    // 1. Ensure default demo storekeeper user exists (never overwrite or delete existing users)
    const existingDemoUser = await User.findOne({ email: "shopkeeper@kiranas.in" });
    if (!existingDemoUser) {
      const passwordHash = await bcrypt.hash("kirana123", 10);
      await User.create({
        name: "Ramesh Sharma",
        email: "shopkeeper@kiranas.in",
        password: passwordHash,
        shopName: "Sharma General & Kirana Store",
        location: "Bilaspur Gram, Dharwad, Karnataka",
        phone: "+91 98765 43210",
        role: "retailer",
        provider: "local"
      });
      console.log("✓ Demo user verified/created: shopkeeper@kiranas.in / kirana123");
    } else {
      console.log("✓ Existing user accounts preserved.");
    }

    // Helper for idempotent upsert of collection
    async function upsertCollection(Model, items, keyField, label) {
      if (!items || items.length === 0) return;
      const operations = items.map((doc) => ({
        updateOne: {
          filter: { [keyField]: doc[keyField] },
          update: { $set: doc },
          upsert: true
        }
      }));
      // Batch execute in chunks of 500 for high performance
      const chunkSize = 500;
      let totalUpserted = 0;
      for (let i = 0; i < operations.length; i += chunkSize) {
        const chunk = operations.slice(i, i + chunkSize);
        const res = await Model.bulkWrite(chunk);
        totalUpserted += (res.upsertedCount || 0) + (res.modifiedCount || 0) + (res.matchedCount || 0);
      }
      console.log(`✓ Seeded ${label}: ${items.length} records processed (upserted/updated).`);
    }

    // Load data from JSON files
    const stores = loadData("stores.json");
    const categories = loadData("categories.json");
    const suppliers = loadData("suppliers.json");
    const products = loadData("products.json");
    const inventory = loadData("inventory.json");
    const sales = loadData("sales.json");
    const purchaseOrders = loadData("purchaseOrders.json");
    const logistics = loadData("logistics.json");
    const forecasts = loadData("forecasts.json");
    const stockAlerts = loadData("stockAlerts.json");
    const deadStock = loadData("deadStock.json");
    const customers = loadData("customers.json");
    const transactions = loadData("transactions.json");
    const promotions = loadData("promotions.json");

    // Perform idempotent seeding
    await upsertCollection(Store, stores, "storeId", "Stores");
    await upsertCollection(Category, categories, "categoryId", "Categories");
    await upsertCollection(Supplier, suppliers, "supplierId", "Suppliers");
    await upsertCollection(Product, products, "productId", "Products");
    await upsertCollection(Inventory, inventory, "inventoryId", "Inventory Items");
    await upsertCollection(Sale, sales, "saleId", "Sales Records");
    await upsertCollection(PurchaseOrder, purchaseOrders, "orderId", "Purchase Orders");
    await upsertCollection(Logistics, logistics, "shipmentId", "Logistics Shipments");
    await upsertCollection(Forecast, forecasts, "forecastId", "AI Forecasts");
    await upsertCollection(StockAlert, stockAlerts, "alertId", "Stock Alerts");
    await upsertCollection(DeadStock, deadStock, "deadStockId", "Dead Stock Sentinel");
    await upsertCollection(Customer, customers, "customerId", "Customers");
    await upsertCollection(Transaction, transactions, "transactionId", "Transactions");
    await upsertCollection(Promotion, promotions, "promotionId", "Promotions");

    console.log("\n==================================================");
    console.log("✅ DATABASE SEEDING COMPLETED WITH ZERO ERRORS!");
    console.log("==================================================");
  } catch (err) {
    console.error("❌ Seeding Error:", err.message);
    if (err.message.includes("ECONNREFUSED")) {
      console.error("\n💡 NOTE: MongoDB daemon is not running locally on 127.0.0.1:27017.");
      console.error("The KIRANAS backend will seamlessly operate using its in-memory datasets in DEMO MODE.");
      console.error("To seed MongoDB, please start your local mongod service first.\n");
    }
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

seedDatabase();
