import mongoose from "mongoose";

const deadStockSchema = new mongoose.Schema(
  {
    deadStockId: { type: String, required: true, unique: true, index: true },
    storeId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    sku: { type: String, default: "" },
    productName: { type: String, default: "" },
    category: { type: String, default: "" },
    daysSinceLastSale: { type: Number, required: true, min: 0 },
    currentStock: { type: Number, required: true, min: 0 },
    purchasePrice: { type: Number, required: true, min: 0 },
    avgDailyDemand: { type: Number, default: 0 },
    estimatedBlockedCapital: { type: Number, required: true, min: 0 },
    deadStockRisk: { type: String, enum: ["Low", "Medium", "High", "Extreme"], default: "High" },
    suggestedDiscount: { type: Number, default: 15 },
    recommendedAction: { type: String, default: "" },
    bundlePartnerSku: { type: String, default: "" }, // fast-seller SKU for bundle discount
    detectedAt: { type: String, default: () => new Date().toISOString().split("T")[0] }
  },
  { timestamps: true }
);

export const DeadStock = mongoose.models.DeadStock || mongoose.model("DeadStock", deadStockSchema);
export default DeadStock;
