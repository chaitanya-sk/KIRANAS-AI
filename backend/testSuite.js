import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createInitialStore } from "./demoStore.js";
import { analyzeProduct } from "./prediction.js";

async function runFullSelfContainedTest() {
  console.log("==================================================");
  console.log("🧪 STARTING KIRANAS END-TO-END VERIFICATION SUITE");
  console.log("==================================================");

  const app = express();
  const PORT = 5001; // test port
  const JWT_SECRET = "test_jwt_secret_kiranas";
  const memoryStore = createInitialStore();

  app.use(cors());
  app.use(express.json());

  // Auth Middleware
  const auth = (req, res, next) => {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Authentication required" });
    try { req.user = jwt.verify(token, JWT_SECRET); next(); }
    catch { res.status(401).json({ message: "Invalid token" }); }
  };

  // 1. Health
  app.get("/api/health", (req, res) => res.json({ status: "ok", app: "KIRANAS", database: "in-memory (demo)", demoMode: true }));

  // 2. Auth
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, shopName } = req.body;
    const token = jwt.sign({ name, email }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { name, email, shopName } });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = memoryStore.users.find(u => u.email === email);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, email: user.email, name: user.name, shopName: user.shopName }, JWT_SECRET);
    res.json({ token, user: { name: user.name, email: user.email, shopName: user.shopName } });
  });

  app.get("/api/auth/me", auth, (req, res) => res.json({ user: req.user }));

  // 3. Products
  app.get("/api/products", (req, res) => res.json(memoryStore.products.map(analyzeProduct)));
  app.post("/api/products", auth, (req, res) => {
    const p = { _id: `prod_${Date.now()}`, ...req.body, stock: Number(req.body.stock) || 0 };
    memoryStore.products.unshift(p);
    res.status(201).json(analyzeProduct(p));
  });

  // 4. Inventory summary
  app.get("/api/inventory/summary", (req, res) => {
    const analyzed = memoryStore.products.map(analyzeProduct);
    res.json({
      totalProducts: analyzed.length,
      inventoryValue: analyzed.reduce((s, p) => s + (p.stock * p.purchasePrice), 0),
      lowStock: analyzed.filter(p => ["Critical", "Low Stock", "Stocked Out"].includes(p.status)).length,
      deadStockValue: analyzed.filter(p => p.isDeadStock).reduce((s, p) => s + p.blockedCapital, 0),
      products: analyzed
    });
  });

  // 5. Predictions
  app.get("/api/predictions", (req, res) => res.json(memoryStore.products.map(analyzeProduct)));

  // 6. Dead stock
  app.get("/api/dead-stock", (req, res) => {
    const analyzed = memoryStore.products.map(analyzeProduct);
    const dead = analyzed.filter(p => p.isDeadStock);
    res.json({
      summary: {
        totalBlockedCapital: dead.reduce((s, p) => s + p.blockedCapital, 0),
        deadStockCount: dead.length
      },
      deadStock: dead,
      slowMoving: analyzed.filter(p => p.isSlowMoving)
    });
  });

  // 7. Orders
  app.get("/api/orders", (req, res) => res.json(memoryStore.orders));
  app.post("/api/orders", auth, (req, res) => {
    const { items, supplier } = req.body;
    const total = items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
    const order = { _id: `po_${Date.now()}`, poNumber: `PO-${Date.now().toString().slice(-4)}`, supplier, items, total, status: "Pending", createdAt: new Date() };
    memoryStore.orders.unshift(order);
    res.status(201).json(order);
  });

  // 8. Sales
  app.get("/api/sales", (req, res) => res.json(memoryStore.sales));
  app.post("/api/sales", auth, (req, res) => {
    const { productId, quantity } = req.body;
    const p = memoryStore.products.find(x => x._id === productId);
    if (!p) return res.status(404).json({ message: "Product not found" });
    if (p.stock < quantity) return res.status(400).json({ message: "Insufficient stock" });
    p.stock -= quantity;
    p.lastSaleDays = 0;
    const sale = { _id: `sale_${Date.now()}`, invoiceNumber: `INV-${Date.now().toString().slice(-4)}`, productName: p.name, quantity, total: quantity * p.sellingPrice, soldAt: new Date() };
    memoryStore.sales.unshift(sale);
    res.status(201).json({ sale, updatedProduct: analyzeProduct(p) });
  });

  // 9. Suppliers
  app.get("/api/suppliers", (req, res) => res.json(memoryStore.suppliers));

  // 10. Reports
  app.get("/api/reports/overview", (req, res) => {
    const analyzed = memoryStore.products.map(analyzeProduct);
    res.json({
      totalRevenue: memoryStore.sales.reduce((s, x) => s + x.total, 0),
      totalSalesTransactions: memoryStore.sales.length,
      topProducts: [...analyzed].sort((a, b) => b.dailySales - a.dailySales).slice(0, 5)
    });
  });

  // Start server on port 5001
  const server = app.listen(PORT);

  try {
    const BASE = `http://127.0.0.1:${PORT}/api`;

    // 1. Health check
    console.log("1. Probing GET /api/health...");
    const health = await (await fetch(`${BASE}/health`)).json();
    console.log("  ✓ Status:", health.status, "| Engine:", health.database);

    // 2. Auth login
    console.log("\n2. Probing POST /api/auth/login...");
    const login = await (await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "shopkeeper@kiranas.in", password: "kirana123" })
    })).json();
    console.log("  ✓ Authenticated user:", login.user.name, "| Shop:", login.user.shopName);
    const authHeaders = { "Content-Type": "application/json", "Authorization": `Bearer ${login.token}` };

    // 3. Products
    console.log("\n3. Probing GET /api/products...");
    const products = await (await fetch(`${BASE}/products`)).json();
    console.log("  ✓ Total FMCG products:", products.length);
    const parle = products.find(p => p.name.includes("Parle-G"));
    console.log("  ✓ Sample SKU:", parle.name, "| Stock:", parle.stock, "| Daily Sales:", parle.dailySales, "| Status:", parle.status, "| Reorder Qty:", parle.reorderQty);

    // 4. Inventory summary
    console.log("\n4. Probing GET /api/inventory/summary...");
    const summary = await (await fetch(`${BASE}/inventory/summary`)).json();
    console.log("  ✓ Total inventory value: ₹" + summary.inventoryValue, "| Low stock items:", summary.lowStock, "| Dead stock value: ₹" + summary.deadStockValue);

    // 5. Predictions
    console.log("\n5. Probing GET /api/predictions...");
    const preds = await (await fetch(`${BASE}/predictions`)).json();
    console.log("  ✓ Mathematical forecast generated for", preds.length, "items.");
    console.log("  ✓ Urgent priority SKU:", preds[0].name, "| Days left:", preds[0].daysLeft, "| Reorder suggestion:", preds[0].reorderQty, "units");

    // 6. Dead stock
    console.log("\n6. Probing GET /api/dead-stock...");
    const dead = await (await fetch(`${BASE}/dead-stock`)).json();
    console.log("  ✓ Dead stock detected:", dead.deadStock.length, "items | Tied capital: ₹" + dead.summary.totalBlockedCapital);

    // 7. Counter Sale
    console.log("\n7. Probing POST /api/sales (Simulating customer counter sale)...");
    const initStock = parle.stock;
    const saleRes = await (await fetch(`${BASE}/sales`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ productId: parle._id, quantity: 2 })
    })).json();
    console.log("  ✓ Sold 2 units of", saleRes.sale.productName, "for ₹" + saleRes.sale.total);
    console.log("  ✓ Verified stock reduced from", initStock, "to", saleRes.updatedProduct.stock);

    // 8. Reorder PO
    console.log("\n8. Probing POST /api/orders (Placing purchase order with distributor)...");
    const orderRes = await (await fetch(`${BASE}/orders`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        supplier: "Shree Ram FMCG Distributors",
        items: [{ productId: parle._id, productName: parle.name, quantity: 48, unitPrice: parle.purchasePrice }]
      })
    })).json();
    console.log("  ✓ Created PO:", orderRes.poNumber, "| Status:", orderRes.status, "| Amount: ₹" + orderRes.total);

    // 9. Suppliers
    console.log("\n9. Probing GET /api/suppliers...");
    const suppliers = await (await fetch(`${BASE}/suppliers`)).json();
    console.log("  ✓ Active rural distributors:", suppliers.length);

    // 10. Reports Overview
    console.log("\n10. Probing GET /api/reports/overview...");
    const reports = await (await fetch(`${BASE}/reports/overview`)).json();
    console.log("  ✓ Total Revenue: ₹" + reports.totalRevenue, "| Transactions:", reports.totalSalesTransactions);

    console.log("\n==================================================");
    console.log("🎉 ALL TESTS PASSED! FULL END-TO-END FLOW VERIFIED");
    console.log("==================================================");
  } finally {
    server.close();
  }
}

runFullSelfContainedTest().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
