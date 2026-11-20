/**
 * AI Demand Prediction and Inventory Optimization Engine
 * Mathematical forecasting algorithm tailored for rural FMCG Kirana stores.
 *
 * Formulas:
 * 1. Average Daily Sales (V_daily)
 * 2. 7-Day Demand Forecast = ceil(V_daily * 7)
 * 3. Forecast Demand During Lead Time = ceil(V_daily * LeadTime)
 * 4. Safety Stock = Math.max(safetyStock, ceil(V_daily * Math.sqrt(LeadTime) * 1.2))
 * 5. Reorder Point (ROP) = Forecast Demand During Lead Time + Safety Stock
 * 6. Reorder Quantity = Math.max(0, ceil(Forecast Demand During Lead Time + Safety Stock - Current Stock))
 * 7. Days Remaining = Current Stock / V_daily
 * 8. Blocked Capital = Dead Stock Quantity * Purchase Price
 */

export function analyzeProduct(product) {
  const stock = Math.max(0, Number(product.stock) || 0);
  const purchasePrice = Math.max(0, Number(product.purchasePrice) || 0);
  const sellingPrice = Math.max(0, Number(product.sellingPrice) || 0);
  const dailySales = Math.max(0, Number(product.dailySales) || 0);
  const leadTime = Math.max(1, Number(product.leadTime) || 2);
  const safetyStock = Math.max(0, Number(product.safetyStock) || 5);
  const lastSaleDays = Math.max(0, Number(product.lastSaleDays) || 0);

  // 1. Forecast Demand during Lead Time
  const leadTimeDemand = Math.ceil(dailySales * leadTime);

  // 2. 7-Day Demand Forecast
  const forecast7 = Math.ceil(dailySales * 7);

  // 3. 30-Day Demand Forecast
  const forecast30 = Math.ceil(dailySales * 30);

  // 4. Days remaining before stockout
  const daysLeft = dailySales > 0 ? Math.round((stock / dailySales) * 10) / 10 : null;

  // 5. Expected stockout date
  let stockoutDate = "No stockout risk";
  if (daysLeft !== null) {
    const d = new Date();
    d.setDate(d.getDate() + Math.floor(daysLeft));
    stockoutDate = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  // 6. Reorder Point (ROP)
  const reorderPoint = leadTimeDemand + safetyStock;

  // 7. Suggested Reorder Quantity (Formula: Lead Time Demand + Safety Stock - Current Stock)
  const rawReorderQty = Math.ceil(leadTimeDemand + safetyStock - stock);
  const reorderQty = Math.max(0, rawReorderQty);

  // 8. Dead Stock and Slow Moving detection
  // Criteria: No sales in 21+ days OR daily sales == 0 with positive stock
  const isDeadStock = stock > 0 && (lastSaleDays >= 21 || (dailySales === 0 && lastSaleDays >= 14));
  const isSlowMoving = stock > 0 && !isDeadStock && (lastSaleDays >= 10 || (dailySales > 0 && dailySales < 1));

  // 9. Blocked Working Capital
  const blockedCapital = isDeadStock ? Math.round(stock * purchasePrice) : 0;
  const slowBlockedCapital = isSlowMoving ? Math.round(stock * purchasePrice) : 0;

  // 10. Status classification
  let status = "Healthy";
  let priority = "Normal";
  let reason = "Current inventory is sufficient to cover lead time and safety buffer.";
  let recommendation = "Maintain current stock levels. No immediate order needed.";

  if (isDeadStock) {
    status = "Dead Stock";
    priority = "Dead";
    reason = `Zero customer sales for ${lastSaleDays} days with ${stock} unsold units. ₹${blockedCapital.toLocaleString("en-IN")} working capital is tied up.`;
    recommendation = `Liquidate dead stock: Bundle with high-velocity items at 10-15% discount or initiate distributor return to unlock ₹${blockedCapital.toLocaleString("en-IN")}.`;
  } else if (stock === 0) {
    status = "Stocked Out";
    priority = "Critical";
    reason = `Product is completely out of stock. Missing approximately ${dailySales} daily sales.`;
    recommendation = `Place emergency reorder for at least ${reorderQty || Math.ceil(forecast7)} units immediately.`;
  } else if (stock <= leadTimeDemand) {
    status = "Critical";
    priority = "Critical";
    reason = `Current stock (${stock}) will deplete in ${daysLeft} days, faster than the ${leadTime}-day distributor delivery cycle!`;
    recommendation = `Urgent: Place reorder of ${reorderQty} units today to avoid stockout before delivery arrives.`;
  } else if (stock <= reorderPoint) {
    status = "Low Stock";
    priority = "High";
    reason = `Inventory (${stock}) has breached the reorder point (${reorderPoint}). Safety buffer is being consumed.`;
    recommendation = `Order ${reorderQty} units from ${product.supplier || "distributor"} in regular replenishment cycle.`;
  } else if (isSlowMoving) {
    status = "Slow Moving";
    priority = "Low";
    reason = `Low velocity (${dailySales} units/day), last sale ${lastSaleDays} days ago. ${daysLeft ? Math.round(daysLeft) : 60}+ days of stock remaining.`;
    recommendation = "Pause future replenishment. Position at front billing counter to accelerate rotation.";
  } else if (daysLeft && daysLeft > 45) {
    status = "Overstocked";
    priority = "Moderate";
    reason = `High stock depth (${Math.round(daysLeft)} days of supply). Excess inventory holding cost.`;
    recommendation = "Hold further purchase orders until inventory normalizes to 14 days of supply.";
  }

  // Profit margin calculation (Retail Profit Margin = (Selling - Cost) / Selling * 100)
  const marginPerUnit = parseFloat((sellingPrice - purchasePrice).toFixed(2));
  const profitMargin = sellingPrice > 0 ? parseFloat((((sellingPrice - purchasePrice) / sellingPrice) * 100).toFixed(1)) : 0;
  const markupPercent = purchasePrice > 0 ? parseFloat((((sellingPrice - purchasePrice) / purchasePrice) * 100).toFixed(1)) : 0;
  const marginPercent = profitMargin;

  return {
    ...product,
    stock,
    purchasePrice,
    sellingPrice,
    dailySales,
    leadTime,
    safetyStock,
    lastSaleDays,
    leadTimeDemand,
    forecast7,
    forecast30,
    daysLeft,
    stockoutDate,
    reorderPoint,
    reorderQty,
    isDeadStock,
    deadStock: isDeadStock,
    isSlowMoving,
    blockedCapital,
    slowBlockedCapital,
    status,
    priority,
    reason,
    recommendation,
    marginPerUnit,
    profitMargin,
    markupPercent,
    marginPercent
  };
}
