/**
 * Inventory Optimization Service
 * Calculates optimal safety stock buffers, reorder thresholds and movement velocity classifications.
 */
export function optimizeInventoryItem({
  availableQuantity,
  avgDailyDemand,
  leadTimeDays = 2,
  purchaseCost = 10,
  sellingPrice = 12,
  shelfLifeMonths = 12
}) {
  const dailyVelocity = Math.max(0, avgDailyDemand || 0);

  // Buffer calculation: minimum 2 days cover or fixed buffer based on lead time
  const safetyStock = Math.max(3, Math.ceil(dailyVelocity * 1.5));
  const leadTimeDemand = Math.ceil(dailyVelocity * leadTimeDays);
  const reorderPoint = leadTimeDemand + safetyStock;
  const maxStock = Math.ceil(dailyVelocity * 28 + safetyStock); // 4-week max coverage for rural shops

  const stockValue = Math.round(availableQuantity * purchaseCost);
  const potentialRevenue = Math.round(availableQuantity * sellingPrice);
  const profitMargin = purchaseCost > 0 ? Math.round(((sellingPrice - purchaseCost) / sellingPrice) * 100) : 0;

  const daysOfSupply = dailyVelocity > 0 ? Math.round((availableQuantity / dailyVelocity) * 10) / 10 : 999;

  let movementStatus = "Normal";
  if (availableQuantity <= 0) movementStatus = "Stocked Out";
  else if (availableQuantity <= leadTimeDemand) movementStatus = "Critical";
  else if (availableQuantity <= reorderPoint) movementStatus = "Low Stock";
  else if (daysOfSupply > 45) movementStatus = "Overstock";

  return {
    reorderPoint,
    safetyStock,
    maxStock,
    stockValue,
    potentialRevenue,
    profitMargin,
    daysOfSupply,
    movementStatus,
    leadTimeDemand
  };
}

export default { optimizeInventoryItem };
