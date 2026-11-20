import { detectDeadStock } from "./deadStockDetection.js";
import { generateReorderRecommendations } from "./reorderRecommendation.js";
import { calculateDemandForecast } from "./demandPrediction.js";
import { Product, Inventory, Sale, Supplier, PurchaseOrder, Forecast, DeadStock } from "../models.js";

// In-memory conversation history store (keyed by sessionId or user id)
const chatHistories = new Map();

/**
 * Get or initialize conversation history
 */
export function getConversationHistory(sessionId = "default_storekeeper") {
  if (!chatHistories.has(sessionId)) {
    chatHistories.set(sessionId, [
      {
        id: "msg_init",
        role: "assistant",
        content: "Namaste! I am **KIRANAS AI**, your store intelligence assistant. I am connected directly to your store inventory, daily counter sales, distributor lead times, and demand forecasts.\n\nAsk me anything about your stock, what needs to be reordered today, dead stock risks, or supplier purchase orders!",
        timestamp: new Date().toISOString()
      }
    ]);
  }
  return chatHistories.get(sessionId);
}

/**
 * Clear conversation history
 */
export function clearConversationHistory(sessionId = "default_storekeeper") {
  chatHistories.set(sessionId, [
    {
      id: `msg_init_${Date.now()}`,
      role: "assistant",
      content: "Chat history cleared. How can I help you manage your store today?",
      timestamp: new Date().toISOString()
    }
  ]);
  return { success: true, message: "Chat history cleared successfully." };
}

/**
 * Gather live database telemetry for AI grounding
 */
export async function gatherStoreTelemetry(isDbConnected, memoryStore) {
  let products = [];
  let suppliers = [];
  let sales = [];
  let orders = [];

  if (isDbConnected) {
    try {
      products = await Product.find().lean();
      suppliers = await Supplier.find().lean();
      sales = await Sale.find().sort({ saleDate: -1 }).limit(100).lean();
      orders = await PurchaseOrder.find().lean();
    } catch (err) {
      console.warn("MongoDB read failed in AI service, falling back to memory store:", err.message);
    }
  }

  // Fallback to memoryStore
  if (!products || products.length === 0) {
    products = memoryStore?.products || [];
    suppliers = memoryStore?.suppliers || [];
    sales = memoryStore?.sales || [];
    orders = memoryStore?.orders || [];
  }

  // Normalize products
  const normalizedProducts = products.map((p) => {
    const currentStock = p.stock !== undefined ? p.stock : (p.availableQuantity || 0);
    const dailyVelocity = p.dailySales || p.avgDailyDemand || 1;
    const leadTime = p.leadTime || p.leadTimeDays || 2;
    const safetyBuffer = p.minStockLevel || p.safetyStock || p.minStock || 5;
    const purchaseCost = p.purchasePrice || p.purchaseCost || 10;
    const sellingPrice = p.sellingPrice || (purchaseCost * 1.15);
    const lastSaleDays = p.lastSaleDays !== undefined ? p.lastSaleDays : 0;

    const reorderPoint = Math.ceil(dailyVelocity * leadTime + safetyBuffer);
    const isCriticalStock = currentStock <= (dailyVelocity * leadTime);
    const isLowStock = currentStock <= reorderPoint;
    const daysOfCover = dailyVelocity > 0 ? Math.round((currentStock / dailyVelocity) * 10) / 10 : 99;

    return {
      id: p._id || p.productId,
      name: p.name || p.productName,
      sku: p.sku || "SKU-GEN",
      category: p.category || "General FMCG",
      brand: p.brand || "Local",
      currentStock,
      dailyVelocity,
      leadTime,
      safetyBuffer,
      reorderPoint,
      isLowStock,
      isCriticalStock,
      daysOfCover,
      purchaseCost,
      sellingPrice,
      marginPercent: Math.round(((sellingPrice - purchaseCost) / sellingPrice) * 100),
      lastSaleDays,
      supplier: p.supplier || "Local Mandi Distributor",
      supplierId: p.supplierId
    };
  });

  // Calculate high-level metrics
  const totalInventoryValue = normalizedProducts.reduce((sum, p) => sum + (p.currentStock * p.purchaseCost), 0);
  const lowStockItems = normalizedProducts.filter(p => p.isLowStock);
  const criticalStockouts = normalizedProducts.filter(p => p.currentStock <= 0 || p.isCriticalStock);
  const fastMovers = [...normalizedProducts].sort((a, b) => b.dailyVelocity - a.dailyVelocity).slice(0, 5);
  
  // Dead stock items (21+ days without sale or explicitly marked)
  const deadStockItems = normalizedProducts.filter(p => p.lastSaleDays >= 21).map(p => ({
    ...p,
    blockedCapital: Math.round(p.currentStock * p.purchaseCost),
    action: p.lastSaleDays >= 30 ? "Liquidation bundle at 20% discount" : "Place on front counter display"
  }));
  const totalBlockedCapital = deadStockItems.reduce((sum, p) => sum + p.blockedCapital, 0);

  // Reorder recommendations
  const reorderList = normalizedProducts
    .filter(p => p.isLowStock)
    .map(p => {
      const targetStock = Math.ceil(p.dailyVelocity * 14 + p.safetyBuffer);
      const recommendedQty = Math.max(10, Math.ceil(targetStock - p.currentStock));
      return {
        product: p.name,
        sku: p.sku,
        currentStock: p.currentStock,
        reorderPoint: p.reorderPoint,
        dailySales: p.dailyVelocity,
        leadTime: p.leadTime,
        recommendedQty,
        estimatedCost: Math.round(recommendedQty * p.purchaseCost),
        supplier: p.supplier,
        urgency: p.currentStock <= 0 ? "CRITICAL (Stocked Out)" : p.isCriticalStock ? "HIGH" : "MEDIUM"
      };
    })
    .sort((a, b) => (a.urgency === "CRITICAL (Stocked Out)" ? -1 : 1));

  // Sales totals
  const todayRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || s.finalAmount || 0), 0);
  const totalUnitsSoldToday = sales.reduce((sum, s) => {
    if (s.items && Array.isArray(s.items)) {
      return sum + s.items.reduce((acc, i) => acc + (i.quantity || 0), 0);
    }
    return sum + (s.quantitySold || s.quantity || 1);
  }, 0);

  return {
    summary: {
      totalSKUs: normalizedProducts.length,
      totalInventoryValue: Math.round(totalInventoryValue),
      lowStockCount: lowStockItems.length,
      criticalStockoutCount: criticalStockouts.length,
      deadStockCount: deadStockItems.length,
      totalBlockedCapital: Math.round(totalBlockedCapital),
      todayRevenue: Math.round(todayRevenue),
      todayUnitsSold: totalUnitsSoldToday,
      activeSuppliersCount: suppliers.length,
      pendingOrdersCount: orders.filter(o => o.status !== "Delivered").length
    },
    products: normalizedProducts,
    lowStockItems,
    criticalStockouts,
    fastMovers,
    deadStockItems,
    reorderList,
    suppliers,
    orders
  };
}

/**
 * Algorithmic Mathematical Store Intelligence Engine (Runs with zero external dependencies)
 */
function generateMathematicalAnswer(userQuery, telemetry) {
  const q = userQuery.toLowerCase().trim();
  const { summary, products, lowStockItems, criticalStockouts, fastMovers, deadStockItems, reorderList, suppliers, orders } = telemetry;

  // 1. Reorder / Replenishment Query
  if (q.includes("reorder") || q.includes("purchase") || q.includes("buy") || q.includes("order today") || q.includes("restock")) {
    if (reorderList.length === 0) {
      return `### 📦 Store Replenishment Status: Optimal\n\nAll **${summary.totalSKUs} SKUs** currently have sufficient inventory cover based on supplier delivery lead times and safety stock levels. No urgent purchase orders are required today.`;
    }

    let res = `### 📋 Priority Reorder Recommendations for Today\n\n`;
    res += `Based on live sales velocity and distributor transit times, **${reorderList.length} products** have breached their reorder thresholds:\n\n`;
    res += `| Product Name | Current Stock | Reorder Point | Lead Time | Recommended Order | Est. Cost | Urgency |\n`;
    res += `| :--- | :---: | :---: | :---: | :---: | :---: | :--- |\n`;

    reorderList.forEach(r => {
      res += `| **${r.product}** | ${r.currentStock} units | ${r.reorderPoint} units | ${r.leadTime} days | **+${r.recommendedQty} units** | ₹${r.estimatedCost} | \`${r.urgency}\` |\n`;
    });

    const totalOrderCost = reorderList.reduce((acc, r) => acc + r.estimatedCost, 0);
    res += `\n**Total Estimated Capital Required:** ₹${totalOrderCost.toLocaleString("en-IN")}\n\n`;
    res += `> **💡 Actionable Advice:** Place orders for critical items immediately to prevent lost sales while distributor vehicles are in transit.`;
    return res;
  }

  // 2. Dead Stock / Stagnant Inventory Query
  if (q.includes("dead stock") || q.includes("deadstock") || q.includes("slow") || q.includes("stagnant") || q.includes("blocked capital") || q.includes("not selling")) {
    if (deadStockItems.length === 0) {
      return `### 🛡️ Dead Stock Sentinel Report\n\nGood news! No products have been stagnant for 21+ days. All active inventory is moving at acceptable counter velocity.`;
    }

    let res = `### ⚠️ Dead Stock & Frozen Capital Analysis\n\n`;
    res += `Our sentinel detected **${deadStockItems.length} products** locking away **₹${summary.totalBlockedCapital.toLocaleString("en-IN")}** in working capital without sales for 21+ days:\n\n`;

    deadStockItems.forEach((d, idx) => {
      res += `**${idx + 1}. ${d.name}** (${d.sku})\n`;
      res += `- **Shelf Stock:** ${d.currentStock} units\n`;
      res += `- **Days Untouched:** ${d.lastSaleDays} days\n`;
      res += `- **Blocked Capital:** ₹${d.blockedCapital.toLocaleString("en-IN")}\n`;
      res += `- **Recommended Action:** ${d.action}\n\n`;
    });

    res += `> **💡 Capital Recovery Strategy:** Bundle slow items with high-velocity staples (like Parle-G or Maggi) at a 15–20% markdown or initiate distributor return for credit.`;
    return res;
  }

  // 3. Low Stock / Stockouts / Shortages Query
  if (q.includes("low stock") || q.includes("out of stock") || q.includes("shortage") || q.includes("empty") || q.includes("critical")) {
    if (lowStockItems.length === 0) {
      return `### ✅ Stock Availability: All Healthy\n\nNo products are currently in a stockout or critically low state. Total inventory stands at **${summary.totalSKUs} SKUs** worth **₹${summary.totalInventoryValue.toLocaleString("en-IN")}**.`;
    }

    let res = `### 🚨 Inventory Shortage Alert\n\n`;
    res += `Currently **${lowStockItems.length} SKUs** are running dangerously low:\n\n`;
    lowStockItems.forEach(p => {
      const statusBadge = p.currentStock === 0 ? "🔴 STOCKOUT" : p.isCriticalStock ? "🟠 CRITICAL" : "🟡 LOW";
      res += `- **${p.name}**: ${p.currentStock} units remaining (Daily Demand: ${p.dailyVelocity} units/day, Cover: **${p.daysOfCover} days** left) → \`${statusBadge}\`\n`;
    });
    res += `\n**Immediate recommendation:** Open the Reorders page to dispatch replenishment purchase orders.`;
    return res;
  }

  // 4. Fast-Moving / Best Sellers Query
  if (q.includes("fast") || q.includes("best seller") || q.includes("top selling") || q.includes("popular") || q.includes("velocity")) {
    let res = `### 🔥 Top 5 Fast-Moving FMCG Products\n\n`;
    res += `Ranked by average counter sales velocity:\n\n`;
    fastMovers.forEach((p, idx) => {
      res += `**${idx + 1}. ${p.name}**\n`;
      res += `   - Velocity: **${p.dailyVelocity} units/day**\n`;
      res += `   - Current Shelf Stock: ${p.currentStock} units (Cover: ${p.daysOfCover} days)\n`;
      res += `   - Price: ₹${p.sellingPrice} (Cost: ₹${p.purchaseCost}, Margin: ${p.marginPercent}%)\n\n`;
    });
    return res;
  }

  // 5. Sales & Revenue Query
  if (q.includes("sale") || q.includes("revenue") || q.includes("earnings") || q.includes("income") || q.includes("today")) {
    let res = `### 📊 Store Sales & Financial Summary\n\n`;
    res += `- **Today's Revenue:** ₹${summary.todayRevenue.toLocaleString("en-IN")}\n`;
    res += `- **Total Units Sold:** ${summary.todayUnitsSold} items\n`;
    res += `- **Total Inventory Value:** ₹${summary.totalInventoryValue.toLocaleString("en-IN")}\n`;
    res += `- **Capital Locked in Dead Stock:** ₹${summary.totalBlockedCapital.toLocaleString("en-IN")}\n`;
    res += `- **Active SKUs on Shelf:** ${summary.totalSKUs} items\n\n`;
    res += `Counter performance is stable. Check the **Sales Register** page to view individual receipt breakdowns.`;
    return res;
  }

  // 6. Supplier & Purchase Orders Query
  if (q.includes("supplier") || q.includes("distributor") || q.includes("purchase order") || q.includes("order status") || q.includes("delivery")) {
    let res = `### 🚚 Active Purchase Orders & Distributors\n\n`;
    res += `**Active Purchase Orders (${orders.length}):**\n\n`;
    orders.forEach(o => {
      res += `- **${o.poNumber || "PO-REF"}** (${o.supplier})\n`;
      res += `  - Total: ₹${(o.total || 0).toLocaleString("en-IN")} | Status: **${o.status}** | Expected: ${o.expectedDelivery || "In 2 days"}\n`;
    });
    res += `\n**Registered Distributors:**\n`;
    suppliers.forEach(s => {
      res += `- **${s.name}**: Lead Time ~${s.leadTimeDays || s.avgDeliveryTime || 2} days | Phone: ${s.phone || "+91 98765 00000"}\n`;
    });
    return res;
  }

  // 7. Check specific product by name in query
  const matchedProduct = products.find(p => q.includes(p.name.toLowerCase()) || q.includes(p.sku.toLowerCase()) || (p.brand && q.includes(p.brand.toLowerCase())));
  if (matchedProduct) {
    const p = matchedProduct;
    let res = `### 📦 SKU Telemetry: ${p.name}\n\n`;
    res += `- **SKU Code:** \`${p.sku}\`\n`;
    res += `- **Category:** ${p.category} (${p.brand})\n`;
    res += `- **Current Stock:** **${p.currentStock} units**\n`;
    res += `- **Daily Velocity:** ${p.dailyVelocity} units/day\n`;
    res += `- **Stock Cover:** **${p.daysOfCover} days**\n`;
    res += `- **Reorder Threshold:** ${p.reorderPoint} units (Lead Time: ${p.leadTime} days)\n`;
    res += `- **Pricing:** ₹${p.sellingPrice} selling | ₹${p.purchaseCost} cost (Margin: ${p.marginPercent}%)\n`;
    res += `- **Distributor:** ${p.supplier}\n\n`;
    if (p.isLowStock) {
      res += `⚠️ **Warning:** Stock has breached the reorder threshold. Recommended reorder: **+${Math.max(12, Math.ceil(p.dailyVelocity * 14 - p.currentStock))} units**.`;
    } else {
      res += `✅ **Status:** Inventory level is healthy and cover is sufficient.`;
    }
    return res;
  }

  // Default Comprehensive Store Overview
  let res = `### 🏪 KIRANAS Store Health Overview\n\n`;
  res += `Here is your current store summary from real inventory telemetry:\n\n`;
  res += `- **Total Inventory Value:** ₹${summary.totalInventoryValue.toLocaleString("en-IN")} across **${summary.totalSKUs} SKUs**\n`;
  res += `- **Items Requiring Reorder:** **${summary.lowStockCount} products** (Urgent: ${summary.criticalStockoutCount})\n`;
  res += `- **Capital in Dead Stock:** **₹${summary.totalBlockedCapital.toLocaleString("en-IN")}** (${summary.deadStockCount} stagnant products)\n`;
  res += `- **Pending Deliveries:** ${summary.pendingOrdersCount} purchase orders en route\n\n`;
  res += `**You can ask me:**\n`;
  res += `1. *"Which products should I reorder today?"*\n`;
  res += `2. *"What is my dead stock status?"*\n`;
  res += `3. *"Show top 5 fast-moving products"*\n`;
  res += `4. *"How much stock do I have of Parle-G or Maggi?"*`;
  return res;
}

/**
 * Call External LLM API (Google Gemini or OpenAI) if configured
 */
async function callLLMApi({ apiKey, provider, systemPrompt, userMessage, conversationHistory, storeSnapshot }) {
  if (provider === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    // Build context
    const contents = [];
    contents.push({
      role: "user",
      parts: [{ text: `${systemPrompt}\n\n=== LIVE STORE TELEMETRY DATABASE ===\n${JSON.stringify(storeSnapshot, null, 2)}` }]
    });
    contents.push({
      role: "model",
      parts: [{ text: "Understood. I am KIRANAS AI, fully initialized with the live store telemetry database. I will provide accurate, grounded inventory analysis with exact rupee amounts, stock figures, and mathematical replenishment recommendations without fabricating any data." }]
    });

    // Add recent history (up to last 6 messages)
    const recent = conversationHistory.slice(-6);
    for (const msg of recent) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      });
    }

    // Add current query
    contents.push({
      role: "user",
      parts: [{ text: userMessage }]
    });

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error("Empty response from Gemini API");
    }
    return candidateText;
  } else if (provider === "openai") {
    const url = "https://api.openai.com/v1/chat/completions";
    const messages = [
      { role: "system", content: `${systemPrompt}\n\n=== LIVE STORE TELEMETRY DATABASE ===\n${JSON.stringify(storeSnapshot, null, 2)}` }
    ];

    const recent = conversationHistory.slice(-6);
    for (const msg of recent) {
      messages.push({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content
      });
    }
    messages.push({ role: "user", content: userMessage });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.2,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || "No response generated.";
  }

  throw new Error("Unsupported LLM provider");
}

/**
 * Main AI Chat Processor
 */
export async function processAIChat({
  message,
  sessionId = "default_storekeeper",
  isDbConnected = false,
  memoryStore = null
}) {
  if (!message || typeof message !== "string" || !message.trim()) {
    throw new Error("Message text is required.");
  }

  const cleanMessage = message.trim();
  if (cleanMessage.length > 1000) {
    throw new Error("Message exceeds maximum allowed length of 1000 characters.");
  }

  // 1. Gather live telemetry
  const telemetry = await gatherStoreTelemetry(isDbConnected, memoryStore);

  // 2. Determine LLM Configuration
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  let reply = "";
  let engineUsed = "kiranas-mathematical";
  let llmConfigured = Boolean(geminiKey || openaiKey);

  const systemPrompt = `You are KIRANAS AI, the intelligent store co-pilot for Indian rural and semi-urban Kirana shopkeepers.
You help shopkeepers stop tying up working capital in dead stock and prevent running out of fast-selling FMCG items.
CRITICAL INSTRUCTIONS:
- You are grounded in the provided LIVE STORE TELEMETRY DATABASE.
- NEVER fabricate, invent, or estimate stock numbers, prices, or sales figures that are not present in the data.
- Always quote prices in Indian Rupees (₹).
- When asked for reorders, calculate: reorder threshold = (daily sales * lead time) + safety stock. If current stock <= reorder threshold, recommend reordering.
- For dead stock: identify items with 21+ days without sale and report blocked capital.
- Keep responses practical, concise, encouraging, and structured using clean Markdown headings, bullet points, and tables.`;

  // Try LLM API first if configured
  if (geminiKey) {
    try {
      reply = await callLLMApi({
        apiKey: geminiKey,
        provider: "gemini",
        systemPrompt,
        userMessage: cleanMessage,
        conversationHistory: getConversationHistory(sessionId),
        storeSnapshot: telemetry
      });
      engineUsed = "google-gemini";
    } catch (err) {
      console.warn("Gemini API call failed, falling back to Mathematical Engine:", err.message);
      reply = generateMathematicalAnswer(cleanMessage, telemetry);
      reply += `\n\n*(Note: Generated via KIRANAS Local Mathematical Engine — Gemini API attempt failed: ${err.message.slice(0, 70)}...)*`;
    }
  } else if (openaiKey) {
    try {
      reply = await callLLMApi({
        apiKey: openaiKey,
        provider: "openai",
        systemPrompt,
        userMessage: cleanMessage,
        conversationHistory: getConversationHistory(sessionId),
        storeSnapshot: telemetry
      });
      engineUsed = "openai-gpt";
    } catch (err) {
      console.warn("OpenAI API call failed, falling back to Mathematical Engine:", err.message);
      reply = generateMathematicalAnswer(cleanMessage, telemetry);
      reply += `\n\n*(Note: Generated via KIRANAS Local Mathematical Engine — OpenAI API attempt failed)*`;
    }
  } else {
    // Built-in Mathematical Engine with notice
    reply = generateMathematicalAnswer(cleanMessage, telemetry);
    engineUsed = "kiranas-mathematical";
  }

  // 3. Save to History
  const history = getConversationHistory(sessionId);
  const userMsg = {
    id: `msg_u_${Date.now()}`,
    role: "user",
    content: cleanMessage,
    timestamp: new Date().toISOString()
  };
  const assistantMsg = {
    id: `msg_a_${Date.now()}`,
    role: "assistant",
    content: reply,
    engine: engineUsed,
    timestamp: new Date().toISOString()
  };

  history.push(userMsg, assistantMsg);
  if (history.length > 50) {
    history.splice(1, history.length - 40); // keep welcome message + last 40
  }

  return {
    reply,
    engine: engineUsed,
    llmConfigured,
    summarySnapshot: telemetry.summary,
    timestamp: assistantMsg.timestamp
  };
}
