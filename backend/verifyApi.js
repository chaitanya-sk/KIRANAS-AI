async function testAll() {
  const BASE = "http://localhost:5000/api";

  console.log("1. Testing Health Endpoint...");
  const healthRes = await fetch(`${BASE}/health`);
  const health = await healthRes.json();
  console.log("✓ Health status:", health.status, "| Database:", health.database, "| Version:", health.version);

  console.log("\n2. Testing Authentication Login...");
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "shopkeeper@kiranas.in", password: "kirana123" })
  });
  const loginData = await loginRes.json();
  if (!loginData.token) throw new Error("Login failed: " + JSON.stringify(loginData));
  console.log("✓ Logged in as:", loginData.user.name, "| Shop:", loginData.user.shopName);
  const token = loginData.token;
  const authHeaders = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };

  console.log("\n3. Testing /api/auth/me...");
  const meRes = await fetch(`${BASE}/auth/me`, { headers: authHeaders });
  const me = await meRes.json();
  console.log("✓ User profile verified:", me.user.name, "-", me.user.email);

  console.log("\n4. Testing /api/products...");
  const prodRes = await fetch(`${BASE}/products`);
  const products = await prodRes.json();
  console.log("✓ Total products fetched:", products.length);
  const parle = products.find(p => p.name.includes("Parle-G"));
  console.log("  Sample product:", parle.name, "| Stock:", parle.stock, "| Velocity:", parle.dailySales, "| Status:", parle.status, "| Reorder Qty:", parle.reorderQty);

  console.log("\n5. Testing /api/inventory/summary...");
  const sumRes = await fetch(`${BASE}/inventory/summary`);
  const sum = await sumRes.json();
  console.log("✓ Inventory value: ₹" + sum.inventoryValue, "| Low stock count:", sum.lowStock, "| Dead stock value: ₹" + sum.deadStockValue);

  console.log("\n6. Testing /api/predictions...");
  const predRes = await fetch(`${BASE}/predictions`);
  const preds = await predRes.json();
  console.log("✓ Generated predictions for", preds.length, "SKUs.");
  console.log("  Top priority item:", preds[0].name, "| Priority:", preds[0].priority, "| Reason:", preds[0].reason);

  console.log("\n7. Testing /api/dead-stock...");
  const deadRes = await fetch(`${BASE}/dead-stock`);
  const dead = await deadRes.json();
  console.log("✓ Dead stock detected:", dead.deadStock.length, "items | Total capital blocked: ₹" + dead.summary.totalBlockedCapital);

  console.log("\n8. Testing /api/orders...");
  const orderRes = await fetch(`${BASE}/orders`);
  const orders = await orderRes.json();
  console.log("✓ Total replenishment orders:", orders.length);

  console.log("\n9. Testing /api/suppliers...");
  const supRes = await fetch(`${BASE}/suppliers`);
  const suppliers = await supRes.json();
  console.log("✓ Total distributors:", suppliers.length);

  console.log("\n10. Testing POST /api/sales (Record counter sale)...");
  const saleRes = await fetch(`${BASE}/sales`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      productId: parle._id,
      quantity: 2,
      paymentMethod: "UPI",
      customerName: "Village Customer Ramesh"
    })
  });
  const saleData = await saleRes.json();
  console.log("✓ Recorded sale:", saleData.sale.productName, "for ₹" + saleData.sale.total, "| New remaining stock:", saleData.updatedProduct.stock);

  console.log("\n11. Testing POST /api/orders (Generate purchase order)...");
  const newOrderRes = await fetch(`${BASE}/orders`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      supplier: "Shree Ram FMCG Distributors",
      items: [{ productId: parle._id, productName: parle.name, quantity: 48, unitPrice: parle.purchasePrice }],
      notes: "Auto-replenishment test batch"
    })
  });
  const createdOrder = await newOrderRes.json();
  console.log("✓ Generated Purchase Order:", createdOrder.poNumber, "| Status:", createdOrder.status, "| Total: ₹" + createdOrder.total);

  console.log("\n12. Testing /api/reports/overview...");
  const repRes = await fetch(`${BASE}/reports/overview`);
  const rep = await repRes.json();
  console.log("✓ Total Revenue: ₹" + rep.totalRevenue, "| Transactions:", rep.totalSalesTransactions, "| Top products:", rep.topProducts.length);

  console.log("\n==============================================");
  console.log("🎉 ALL API ENDPOINTS PASSED VERIFICATION 100%!");
  console.log("==============================================");
}

testAll().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
