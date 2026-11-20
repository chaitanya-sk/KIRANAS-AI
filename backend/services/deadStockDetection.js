/**
 * Dead Stock Detection Service
 * Identifies slow-moving and non-selling SKUs locking away shopkeeper working capital.
 */
export function detectDeadStock({
  productId,
  sku,
  name,
  category,
  currentStock,
  purchasePrice,
  daysSinceLastSale = 0,
  avgDailyDemand = 0
}) {
  const isCandidate = daysSinceLastSale >= 21 || (daysSinceLastSale >= 14 && avgDailyDemand < 0.1);
  const isConfirmedDeadStock = daysSinceLastSale >= 30;

  const estimatedBlockedCapital = Math.round(currentStock * purchasePrice);

  let deadStockRisk = "Low";
  if (daysSinceLastSale >= 45 || (daysSinceLastSale >= 30 && currentStock > 20)) {
    deadStockRisk = "Extreme";
  } else if (daysSinceLastSale >= 30) {
    deadStockRisk = "High";
  } else if (daysSinceLastSale >= 21) {
    deadStockRisk = "Medium";
  }

  // Actionable liquidation recommendation
  let suggestedDiscount = 0;
  let recommendedAction = "Maintain standard display. Monitor weekly sales.";

  if (deadStockRisk === "Extreme") {
    suggestedDiscount = 25;
    recommendedAction = `Immediate capital liquidation: Bundle with fast-seller at ${suggestedDiscount}% discount or request distributor buyback/return.`;
  } else if (deadStockRisk === "High") {
    suggestedDiscount = 15;
    recommendedAction = `Promote at checkout counter with ${suggestedDiscount}% markdown bundle. Freeze all upcoming purchase orders.`;
  } else if (deadStockRisk === "Medium") {
    suggestedDiscount = 10;
    recommendedAction = "Place on prominent front counter shelf. Offer small multi-pack discount.";
  }

  return {
    productId,
    sku,
    name,
    category,
    currentStock,
    purchasePrice,
    daysSinceLastSale,
    avgDailyDemand,
    estimatedBlockedCapital,
    isDeadStock: isCandidate,
    isConfirmedDeadStock,
    deadStockRisk,
    suggestedDiscount,
    recommendedAction,
    capitalRecoveryPotential: Math.round(estimatedBlockedCapital * (1 - suggestedDiscount / 100))
  };
}

export default { detectDeadStock };
