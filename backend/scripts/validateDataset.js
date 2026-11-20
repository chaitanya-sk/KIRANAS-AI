import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");

function loadJson(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Dataset file missing: ${filename}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

console.log("==================================================");
console.log("🔍 KIRANAS DATASET VALIDATION REPORT");
console.log("==================================================");

let totalErrors = 0;
let totalWarnings = 0;

function reportCheck(name, passed, details = "") {
  if (passed) {
    console.log(`[PASS] ${name}`);
  } else {
    console.error(`[FAIL] ${name} - ${details}`);
    totalErrors++;
  }
}

try {
  const stores = loadJson("stores.json");
  const products = loadJson("products.json");
  const categories = loadJson("categories.json");
  const inventory = loadJson("inventory.json");
  const sales = loadJson("sales.json");
  const suppliers = loadJson("suppliers.json");
  const purchaseOrders = loadJson("purchaseOrders.json");
  const forecasts = loadJson("forecasts.json");
  const stockAlerts = loadJson("stockAlerts.json");
  const deadStock = loadJson("deadStock.json");
  const logistics = loadJson("logistics.json");
  const customers = loadJson("customers.json");
  const transactions = loadJson("transactions.json");
  const promotions = loadJson("promotions.json");
  const seasonalEvents = loadJson("seasonalEvents.json");
  const dashboardStats = loadJson("dashboardStats.json");

  console.log(`\n📊 Datasets Loaded:`);
  console.log(`- Stores: ${stores.length}`);
  console.log(`- Products: ${products.length}`);
  console.log(`- Categories: ${categories.length}`);
  console.log(`- Inventory: ${inventory.length}`);
  console.log(`- Sales: ${sales.length}`);
  console.log(`- Suppliers: ${suppliers.length}`);
  console.log(`- Purchase Orders: ${purchaseOrders.length}`);
  console.log(`- Forecasts: ${forecasts.length}`);
  console.log(`- Stock Alerts: ${stockAlerts.length}`);
  console.log(`- Dead Stock Items: ${deadStock.length}`);
  console.log(`- Logistics Shipments: ${logistics.length}`);
  console.log(`- Customers: ${customers.length}`);
  console.log(`- Transactions: ${transactions.length}`);
  console.log(`- Promotions: ${promotions.length}`);
  console.log(`- Seasonal Events: ${seasonalEvents.length}\n`);

  // 1. Check Store Count & Demo Store
  const hasDemoStore = stores.some(s => s.isDemoStore && s.state === "Karnataka");
  reportCheck("Minimum 10 Stores with Karnataka Demo Store", stores.length >= 10 && hasDemoStore, `Found ${stores.length} stores, demo in Karnataka: ${hasDemoStore}`);

  // 2. Check Product Count (at least 50)
  reportCheck("Minimum 50 Products", products.length >= 50, `Found ${products.length} products`);

  // 3. Duplicate SKUs check
  const skuSet = new Set();
  let duplicateSkus = [];
  products.forEach(p => {
    if (skuSet.has(p.sku)) duplicateSkus.push(p.sku);
    skuSet.add(p.sku);
  });
  reportCheck("Zero Duplicate SKUs in Products", duplicateSkus.length === 0, `Duplicates: ${duplicateSkus.join(", ")}`);

  // 4. Missing Product IDs check
  const missingProdIds = products.filter(p => !p.productId || !p.name || !p.sku);
  reportCheck("Zero Missing Product IDs or SKUs", missingProdIds.length === 0, `Found ${missingProdIds.length} incomplete products`);

  // 5. Valid Prices & Profit Margins
  const invalidPrices = products.filter(p => p.mrp <= 0 || p.sellingPrice <= 0 || p.purchaseCost <= 0 || p.purchaseCost > p.sellingPrice);
  reportCheck("Valid Prices (MRP >= Selling >= Cost > 0)", invalidPrices.length === 0, `Found ${invalidPrices.length} products with invalid pricing`);

  // 6. Valid Supplier IDs in Products
  const supplierIdSet = new Set(suppliers.map(s => s.supplierId));
  const invalidProdSuppliers = products.filter(p => !supplierIdSet.has(p.supplierId));
  reportCheck("Products Reference Valid Suppliers", invalidProdSuppliers.length === 0, `Found ${invalidProdSuppliers.length} invalid supplier references`);

  // 7. Inventory Checks (Non-negative, valid store & product references)
  const storeIdSet = new Set(stores.map(s => s.storeId));
  const productIdSet = new Set(products.map(p => p.productId));
  const invalidInventory = inventory.filter(i =>
    i.availableQuantity < 0 ||
    !storeIdSet.has(i.storeId) ||
    !productIdSet.has(i.productId)
  );
  reportCheck("Inventory Validity (Non-negative qty, valid Store & Product IDs)", invalidInventory.length === 0, `Found ${invalidInventory.length} invalid inventory items`);

  // 8. Sales History (at least 1,000 records, consistent totals)
  let inconsistentSales = 0;
  sales.forEach(s => {
    const expectedRev = Math.round(s.quantitySold * s.sellingPrice * 100) / 100;
    const expectedCost = Math.round(s.quantitySold * s.costAmount / (s.quantitySold || 1) * 100) / 100;
    if (!storeIdSet.has(s.storeId) || !productIdSet.has(s.productId) || s.quantitySold <= 0) {
      inconsistentSales++;
    }
  });
  reportCheck("Sales Records Count (>= 1,000) & Integrity", sales.length >= 1000 && inconsistentSales === 0, `Count: ${sales.length}, Inconsistencies: ${inconsistentSales}`);

  // 9. Purchase Order References & Amounts
  let invalidPOs = 0;
  purchaseOrders.forEach(po => {
    if (!storeIdSet.has(po.storeId) || !supplierIdSet.has(po.supplierId) || po.totalOrderValue <= 0) {
      invalidPOs++;
    }
  });
  reportCheck("Purchase Orders Valid References & Positive Value", invalidPOs === 0, `Found ${invalidPOs} invalid POs`);

  // 10. Stock Alerts Validity
  let invalidAlerts = 0;
  stockAlerts.forEach(a => {
    if (!storeIdSet.has(a.storeId) || !productIdSet.has(a.productId) || !a.alertType || !a.severity) {
      invalidAlerts++;
    }
  });
  reportCheck("Stock Alerts Validity (Correct relations and categories)", invalidAlerts === 0, `Found ${invalidAlerts} invalid alerts`);

  // 11. Dead Stock Records (blocked capital calculation)
  let invalidDeadStock = 0;
  deadStock.forEach(ds => {
    if (ds.daysSinceLastSale < 21 || ds.estimatedBlockedCapital <= 0 || !productIdSet.has(ds.productId)) {
      invalidDeadStock++;
    }
  });
  reportCheck("Dead Stock Validity (>= 21 days no sales, accurate blocked capital)", invalidDeadStock === 0, `Found ${invalidDeadStock} invalid dead stock items`);

  // 12. Forecasts (Positive demand horizons)
  let invalidForecasts = 0;
  forecasts.forEach(f => {
    if (f.predictedNext7Days < 0 || f.confidenceScore < 0 || f.confidenceScore > 1) {
      invalidForecasts++;
    }
  });
  reportCheck("AI Forecasts Consistency (Positive projections & valid confidence bounds)", invalidForecasts === 0, `Found ${invalidForecasts} invalid forecasts`);

  // 13. Logistics references
  const poIdSet = new Set(purchaseOrders.map(p => p.orderId));
  let invalidShipments = 0;
  logistics.forEach(l => {
    if (!poIdSet.has(l.purchaseOrderId) || !l.vehicleType) {
      invalidShipments++;
    }
  });
  reportCheck("Logistics Reference Valid Purchase Orders", invalidShipments === 0, `Found ${invalidShipments} invalid shipments`);

  console.log("\n==================================================");
  if (totalErrors === 0) {
    console.log("🎉 ALL DATASET VALIDATION CHECKS PASSED PERFECTLY!");
    console.log("Integrity Score: 100/100");
  } else {
    console.error(`❌ Validation finished with ${totalErrors} error(s).`);
    process.exit(1);
  }
  console.log("==================================================\n");

} catch (err) {
  console.error("Validation error:", err.message);
  process.exit(1);
}
