/**
 * Demand Prediction Service
 * Implements moving averages and baseline trend forecasting for rural Kirana FMCG items.
 */
export function calculateDemandForecast({
  productId,
  sku,
  productName,
  historicalSales = [],
  currentStock = 0,
  leadTimeDays = 2,
  safetyStock = 5
}) {
  // Sort sales chronologically
  const sorted = [...historicalSales].sort(
    (a, b) => new Date(a.saleDate).getTime() - new Date(b.saleDate).getTime()
  );

  const totalDays = Math.max(1, sorted.length);
  const totalQuantity = sorted.reduce((sum, s) => sum + (s.quantitySold || s.quantity || 0), 0);
  const avgDailyDemand = Math.round((totalQuantity / totalDays) * 100) / 100;

  // Last 7 days and last 30 days demand
  const last7DaysSales = sorted.slice(-7);
  const last7Demand = last7DaysSales.reduce((sum, s) => sum + (s.quantitySold || s.quantity || 0), 0);
  const recent7DailyAvg = last7DaysSales.length > 0 ? last7Demand / last7DaysSales.length : avgDailyDemand;

  const last30DaysSales = sorted.slice(-30);
  const last30Demand = last30DaysSales.reduce((sum, s) => sum + (s.quantitySold || s.quantity || 0), 0);

  // Demand Trend Analysis
  let demandTrend = "Stable";
  if (recent7DailyAvg > avgDailyDemand * 1.15) {
    demandTrend = "Increasing";
  } else if (recent7DailyAvg < avgDailyDemand * 0.85) {
    demandTrend = "Decreasing";
  }

  // Trend-adjusted forecast calculations
  const trendMultiplier = demandTrend === "Increasing" ? 1.1 : demandTrend === "Decreasing" ? 0.9 : 1.0;
  const effectiveDaily = Math.max(0.1, recent7DailyAvg * trendMultiplier);

  const predictedNext7Days = Math.ceil(effectiveDaily * 7);
  const predictedNext14Days = Math.ceil(effectiveDaily * 14);
  const predictedNext30Days = Math.ceil(effectiveDaily * 30);

  // Confidence Score: based on data completeness and consistency
  const variance = sorted.reduce((acc, s) => {
    const diff = (s.quantitySold || s.quantity || 0) - avgDailyDemand;
    return acc + diff * diff;
  }, 0) / totalDays;
  const stdDev = Math.sqrt(variance);
  const cv = avgDailyDemand > 0 ? stdDev / avgDailyDemand : 1;
  const confidenceScore = Math.min(0.95, Math.max(0.70, Math.round((1 - Math.min(cv, 0.5) * 0.4) * 100) / 100));

  // Lead-Time Stockout & Suggested Reorder Calculation
  const leadTimeDemand = effectiveDaily * leadTimeDays;
  const reorderPoint = Math.ceil(leadTimeDemand + safetyStock);
  const daysOfCover = effectiveDaily > 0 ? Math.round((currentStock / effectiveDaily) * 10) / 10 : 99;

  let stockoutRisk = "Low";
  if (currentStock <= 0) stockoutRisk = "Critical";
  else if (currentStock <= leadTimeDemand) stockoutRisk = "High";
  else if (currentStock <= reorderPoint) stockoutRisk = "Medium";

  let overstockRisk = "Low";
  if (daysOfCover > 45) overstockRisk = "High";
  else if (daysOfCover > 30) overstockRisk = "Medium";

  // Suggested reorder quantity (never negative)
  const targetStock = Math.ceil(effectiveDaily * 14 + safetyStock);
  const rawReorder = targetStock - currentStock;
  const suggestedReorderQty = currentStock <= reorderPoint ? Math.max(0, rawReorder) : 0;

  // Recommended Reorder Date
  const daysUntilReorder = Math.max(0, Math.floor((currentStock - reorderPoint) / (effectiveDaily || 1)));
  const reorderDate = new Date();
  reorderDate.setDate(reorderDate.getDate() + daysUntilReorder);
  const recommendedReorderDate = reorderDate.toISOString().split("T")[0];

  return {
    productId,
    sku,
    productName,
    avgDailyDemand: Math.round(avgDailyDemand * 10) / 10,
    last7DayDemand: last7Demand,
    last30DayDemand: last30Demand,
    predictedNext7Days,
    predictedNext14Days,
    predictedNext30Days,
    demandTrend,
    confidenceScore,
    suggestedReorderQty,
    recommendedReorderDate,
    overstockRisk,
    stockoutRisk,
    daysOfCover,
    reorderPoint,
    modelLabel: "DEMO Baseline Moving Average (Synthetic)"
  };
}

export default { calculateDemandForecast };
