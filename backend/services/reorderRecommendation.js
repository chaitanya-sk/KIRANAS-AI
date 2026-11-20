/**
 * Reorder Recommendation Service
 * Generates distributor-grouped replenishment recommendations based on lead times and stockouts.
 */
export function generateReorderRecommendations({
  products = [],
  suppliers = [],
  forecasts = []
}) {
  const supplierMap = new Map();
  suppliers.forEach(s => supplierMap.set(s.supplierId, s));

  const forecastMap = new Map();
  forecasts.forEach(f => forecastMap.set(f.productId, f));

  const itemsToReorder = [];

  for (const product of products) {
    const forecast = forecastMap.get(product.productId) || {};
    const supplier = supplierMap.get(product.supplierId) || { name: "Local Mandi Distributor", leadTimeDays: 2 };

    const dailyDemand = forecast.avgDailyDemand || product.avgDailyDemand || 1;
    const leadTime = supplier.avgDeliveryTime || supplier.leadTimeDays || product.leadTime || 2;
    const safetyStock = product.minStock || 5;
    const currentStock = product.stock !== undefined ? product.stock : (product.availableQuantity || 0);

    const reorderPoint = Math.ceil(dailyDemand * leadTime + safetyStock);

    if (currentStock <= reorderPoint) {
      const targetStock = Math.ceil(dailyDemand * 14 + safetyStock);
      const recommendedQty = Math.max(10, Math.ceil(targetStock - currentStock));
      const unitCost = product.purchaseCost || product.purchasePrice || 10;

      itemsToReorder.push({
        productId: product.productId,
        sku: product.sku,
        productName: product.name,
        currentStock,
        reorderPoint,
        dailyVelocity: dailyDemand,
        leadTimeDays: leadTime,
        recommendedQuantity: recommendedQty,
        unitCost,
        estimatedOrderValue: recommendedQty * unitCost,
        supplierId: product.supplierId,
        supplierName: supplier.name,
        urgency: currentStock <= 0 ? "Critical (Stockout)" : currentStock <= (dailyDemand * leadTime) ? "High" : "Medium",
        reason: currentStock <= 0
          ? `Product is completely stocked out. Expected demand is ${Math.ceil(dailyDemand * 7)} units/week.`
          : `Stock (${currentStock}) is below reorder threshold (${reorderPoint}). Order now to avoid stockout during ${leadTime}-day transit.`
      });
    }
  }

  // Group by supplier for purchase orders
  const groupedBySupplier = {};
  itemsToReorder.forEach(item => {
    const sId = item.supplierId || "general_mandi";
    if (!groupedBySupplier[sId]) {
      groupedBySupplier[sId] = {
        supplierId: sId,
        supplierName: item.supplierName,
        totalItems: 0,
        totalEstimatedValue: 0,
        items: []
      };
    }
    groupedBySupplier[sId].items.push(item);
    groupedBySupplier[sId].totalItems += item.recommendedQuantity;
    groupedBySupplier[sId].totalEstimatedValue += item.estimatedOrderValue;
  });

  return {
    totalRecommendedItems: itemsToReorder.length,
    totalEstimatedPOValue: itemsToReorder.reduce((sum, i) => sum + i.estimatedOrderValue, 0),
    items: itemsToReorder,
    groupedBySupplier: Object.values(groupedBySupplier)
  };
}

export default { generateReorderRecommendations };
