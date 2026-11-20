import http from "http";

function fetchHttp(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, text: data });
        }
      });
    });
    req.on("error", reject);
    if (postData) {
      req.write(typeof postData === "string" ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function verifyAll() {
  console.log("==================================================");
  console.log("🔍 FULL KIRANAS SYSTEM & CONNECTION VERIFICATION");
  console.log("==================================================");

  let passed = 0;
  let total = 0;
  function test(pass, name, details = "") {
    total++;
    if (pass) {
      console.log(`✅ [PASS] ${name} ${details ? '(' + details + ')' : ''}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} ${details ? '(' + details + ')' : ''}`);
    }
  }

  try {
    // 1. Backend /api/health
    const health = await fetchHttp({
      hostname: "localhost",
      port: 5000,
      path: "/api/health",
      method: "GET"
    });
    test(health.status === 200, "Backend GET /api/health returns HTTP 200", `status: ${health.body?.status}`);

    // 2. CORS Preflight Check from Frontend Origin (http://localhost:5173)
    const corsPreflight = await fetchHttp({
      hostname: "localhost",
      port: 5000,
      path: "/api/products",
      method: "OPTIONS",
      headers: {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type, Authorization"
      }
    });
    const allowOrigin = corsPreflight.headers["access-control-allow-origin"];
    const allowCreds = corsPreflight.headers["access-control-allow-credentials"];
    test(
      corsPreflight.status === 200 || corsPreflight.status === 204,
      "CORS Preflight (OPTIONS) supported",
      `Allow-Origin: ${allowOrigin}, Credentials: ${allowCreds}`
    );

    // 3. Frontend dev server check (http://localhost:5173)
    const frontendRes = await fetchHttp({
      hostname: "localhost",
      port: 5173,
      path: "/",
      method: "GET"
    });
    test(frontendRes.status === 200 && (frontendRes.text || "").toLowerCase().includes("<!doctype html>"), "Frontend serving index.html on port 5173");

    // 4. Test Login API (POST /api/auth/login)
    const loginRes = await fetchHttp(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json", "Origin": "http://localhost:5173" }
      },
      { email: "shopkeeper@kiranas.in", password: "kirana123" }
    );
    test(loginRes.status === 200 && loginRes.body?.token, "Authentication Login (shopkeeper@kiranas.in)", `Role: ${loginRes.body?.user?.role}`);
    const token = loginRes.body?.token;

    // 5. Authenticated me endpoint (GET /api/auth/me)
    const meRes = await fetchHttp({
      hostname: "localhost",
      port: 5000,
      path: "/api/auth/me",
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Origin": "http://localhost:5173"
      }
    });
    test(meRes.status === 200 && meRes.body?.user?.email === "shopkeeper@kiranas.in", "Session validation GET /api/auth/me");

    // 6. Products API (GET /api/products)
    const productsRes = await fetchHttp({
      hostname: "localhost",
      port: 5000,
      path: "/api/products",
      method: "GET",
      headers: { "Origin": "http://localhost:5173" }
    });
    test(productsRes.status === 200 && Array.isArray(productsRes.body) && productsRes.body.length > 0, "Products API GET /api/products", `Count: ${productsRes.body?.length}`);

    // 7. Pricing Update API (PUT /api/products/:id)
    const firstProduct = productsRes.body[0];
    const updatePriceRes = await fetchHttp(
      {
        hostname: "localhost",
        port: 5000,
        path: `/api/products/${firstProduct._id}`,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Origin": "http://localhost:5173"
        }
      },
      { purchasePrice: 8.50, sellingPrice: 12.75 }
    );
    test(
      updatePriceRes.status === 200 && updatePriceRes.body?.purchasePrice === 8.50 && updatePriceRes.body?.sellingPrice === 12.75,
      "Decimal Pricing Update (PUT /api/products/:id)",
      `Cost: ₹${updatePriceRes.body?.purchasePrice}, MRP: ₹${updatePriceRes.body?.sellingPrice}`
    );

    // 8. Purchase Orders API (GET & POST /api/orders)
    const poRes = await fetchHttp(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/orders",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Origin": "http://localhost:5173"
        }
      },
      {
        supplier: "Shree Ram FMCG Distributors",
        expectedDelivery: "In 2 days",
        items: [
          { productId: firstProduct._id, productName: firstProduct.name, quantity: 20, unitPrice: 8.50 }
        ]
      }
    );
    test(poRes.status === 201 && poRes.body?.total === 170.00, "Purchase Order Creation (POST /api/orders)", `Total: ₹${poRes.body?.total}`);

    // 9. AI Assistant API (POST /api/ai/chat)
    const aiRes = await fetchHttp(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/ai/chat",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Origin": "http://localhost:5173"
        }
      },
      { message: "What products are low on stock?" }
    );
    test(aiRes.status === 200 && aiRes.body?.reply, "AI Chatbot API (POST /api/ai/chat)", `Response length: ${aiRes.body?.reply?.length} chars`);

    // 10. Direct Route Refresh on /sales (HTTP 200 via SPA History API fallback)
    const salesPageRes = await fetchHttp({
      hostname: "localhost",
      port: 5173,
      path: "/sales",
      method: "GET"
    });
    test(
      salesPageRes.status === 200 && (salesPageRes.text || "").toLowerCase().includes("<!doctype html>"),
      "Frontend SPA Route Refresh Support (GET http://localhost:5173/sales)",
      `Status: ${salesPageRes.status}`
    );

    // 11. Sales Ledger API (GET & POST /api/sales)
    const salesRes = await fetchHttp({
      hostname: "localhost",
      port: 5000,
      path: "/api/sales",
      method: "GET",
      headers: { "Origin": "http://localhost:5173" }
    });
    test(salesRes.status === 200 && Array.isArray(salesRes.body), "Sales Ledger API (GET /api/sales)", `Records: ${salesRes.body?.length}`);

    const newSaleRes = await fetchHttp(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/sales",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Origin": "http://localhost:5173"
        }
      },
      {
        productId: firstProduct._id,
        quantity: 2,
        paymentMethod: "UPI",
        customerName: "Village Counter Test"
      }
    );
    test(newSaleRes.status === 201 && newSaleRes.body?.sale?.invoiceNumber, "Record Counter Sale (POST /api/sales)", `Invoice: ${newSaleRes.body?.sale?.invoiceNumber}`);

    console.log("==================================================");
    console.log(`🏁 SUMMARY: ${passed}/${total} CHECKS PASSED`);
    console.log("==================================================");

    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error("Verification error:", err);
    process.exit(1);
  }
}

verifyAll();
