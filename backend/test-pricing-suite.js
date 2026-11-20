import http from "http";

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, text: data });
        }
      });
    });
    req.on("error", reject);
    if (body) {
      req.write(typeof body === "string" ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("==================================================");
  console.log("🧪 KIRANAS PRICING & PURCHASE ORDER TEST SUITE");
  console.log("==================================================");

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
    }
  }

  try {
    // 1. Health check
    const health = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/health",
      method: "GET"
    });
    assert(health.status === 200 && (health.data.status === "ok" || health.data.status === "healthy" || health.data.success === true), "GET /api/health returns 200 healthy");

    // 2. Login to get token
    const loginRes = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" }
      },
      { email: "shopkeeper@kiranas.in", password: "kirana123" }
    );
    assert(loginRes.status === 200 && loginRes.data.token, "POST /api/auth/login returns JWT token");
    const token = loginRes.data.token;
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };

    // 3. GET /api/products and inspect profit margin calculation
    const productsRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/products",
      method: "GET"
    });
    assert(productsRes.status === 200 && Array.isArray(productsRes.data), "GET /api/products returns products array");
    const testProd = productsRes.data[0];
    assert(testProd && testProd._id, `Found existing product to test: "${testProd.name}"`);

    // 4. PUT /api/products/:id - Edit purchase price and selling price to custom decimals
    const updateRes = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: `/api/products/${testProd._id}`,
        method: "PUT",
        headers: authHeaders
      },
      {
        purchasePrice: 8.50,
        sellingPrice: 12.75
      }
    );
    assert(updateRes.status === 200, "PUT /api/products/:id accepts custom decimal prices");
    assert(updateRes.data.purchasePrice === 8.50, `Purchase price updated to ₹8.50 (got: ₹${updateRes.data.purchasePrice})`);
    assert(updateRes.data.sellingPrice === 12.75, `Selling price updated to ₹12.75 (got: ₹${updateRes.data.sellingPrice})`);

    // Verify user profit margin formula: ((sellingPrice - purchasePrice) / sellingPrice) * 100
    // ((12.75 - 8.50) / 12.75) * 100 = 33.333% -> 33.3%
    const expectedMargin = parseFloat((((12.75 - 8.50) / 12.75) * 100).toFixed(1));
    assert(
      Math.abs(updateRes.data.profitMargin - expectedMargin) < 0.1 || Math.abs(updateRes.data.marginPercent - expectedMargin) < 0.1,
      `Profit margin formula ((selling - cost) / selling) * 100 calculated correctly (~33.3%, got: ${updateRes.data.profitMargin || updateRes.data.marginPercent}%)`
    );

    // 5. Verify persistence of updated product via GET /api/products
    const verifyProdRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/products",
      method: "GET"
    });
    const reloadedProd = verifyProdRes.data.find(p => p._id === testProd._id);
    assert(reloadedProd.purchasePrice === 8.50 && reloadedProd.sellingPrice === 12.75, "Custom product prices persisted across GET calls");

    // 6. POST /api/products - Add a new custom product with decimal pricing
    const newProductPayload = {
      name: "Custom Rural Spices & Hing (50g)",
      category: "Spices & Condiments",
      brand: "Shree Balaji Pure",
      purchasePrice: 42.50,
      sellingPrice: 60.00,
      stock: 40,
      safetyStock: 10,
      supplier: "Balaji Agencies & Spices Hub",
      unit: "packet"
    };
    const createProdRes = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/products",
        method: "POST",
        headers: authHeaders
      },
      newProductPayload
    );
    assert(createProdRes.status === 201, "POST /api/products creates custom product with 201 Created");
    assert(createProdRes.data.purchasePrice === 42.50, "Created product has exact purchase price ₹42.50");
    assert(createProdRes.data.sellingPrice === 60.00, "Created product has exact selling price ₹60.00");
    const createdId = createProdRes.data._id || createProdRes.data.productId;

    // 7. POST /api/orders - Generate Purchase Order with custom unit price & quantities
    // Item 1: Parle-G: 25 units @ ₹12.00 = ₹300.00 (Example from user prompt)
    // Item 2: Custom Spices: 10 units @ ₹42.50 = ₹425.00
    // Total = ₹725.00
    const poPayload = {
      supplier: "Shree Ram FMCG Distributors",
      expectedDelivery: "Tomorrow by 11 AM",
      notes: "Shopkeeper custom negotiated pricing order",
      items: [
        {
          productId: testProd._id,
          productName: testProd.name,
          quantity: 25,
          unitPrice: 12.00
        },
        {
          productId: createdId,
          productName: "Custom Rural Spices & Hing (50g)",
          quantity: 10,
          unitPrice: 42.50
        }
      ]
    };

    const createOrderRes = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/orders",
        method: "POST",
        headers: authHeaders
      },
      poPayload
    );

    assert(createOrderRes.status === 201, "POST /api/orders creates purchase order with 201 Created");
    assert(createOrderRes.data.items[0].unitPrice === 12.00, "Order item 1 unit price is custom ₹12.00");
    assert(createOrderRes.data.items[0].total === 300.00, "Order item 1 total is automatically ₹300.00 (25 × ₹12)");
    assert(createOrderRes.data.items[1].unitPrice === 42.50, "Order item 2 unit price is custom ₹42.50");
    assert(createOrderRes.data.items[1].total === 425.00, "Order item 2 total is automatically ₹425.00 (10 × ₹42.50)");
    assert(createOrderRes.data.total === 725.00, "Purchase order grand total is automatically calculated: ₹725.00 (300 + 425)");

    // 8. Verify GET /api/orders shows custom prices and grand total
    const getOrdersRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/orders",
      method: "GET"
    });
    assert(getOrdersRes.status === 200 && Array.isArray(getOrdersRes.data), "GET /api/orders returns orders array");
    const savedPO = getOrdersRes.data.find(o => o.poNumber === createOrderRes.data.poNumber);
    assert(savedPO && savedPO.total === 725.00, "Purchase order persisted in database with exact total ₹725.00");
    assert(savedPO.items[0].unitPrice === 12.00 && savedPO.items[0].total === 300.00, "Persisted PO item 1 has exact unitPrice ₹12.00 and total ₹300.00");

    // 9. Negative validation test: negative prices
    const negativePriceRes = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: `/api/products/${testProd._id}`,
        method: "PUT",
        headers: authHeaders
      },
      {
        purchasePrice: -15
      }
    );
    assert(negativePriceRes.status === 400, "PUT /api/products rejects negative purchase price with 400 Bad Request");

    console.log("==================================================");
    console.log(`🏁 TEST RESULTS: ${passed}/${total} TESTS PASSED!`);
    console.log("==================================================");

    if (passed === total) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution failed with error:", err);
    process.exit(1);
  }
}

runTests();
