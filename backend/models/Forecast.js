import mongoose from "mongoose";

const forecastSchema = new mongoose.Schema(
  {
    forecastId: { type: String, required: true, unique: true, index: true },
    storeId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    sku: { type: String, default: "" },
    productName: { type: String, default: "" },
    avgDailyDemand: { type: Number, default: 0, min: 0 },
    last7DayDemand: { type: Number, default: 0, min: 0 },
    last30DayDemand: { type: Number, default: 0, min: 0 },
    predictedNext7Days: { type: Number, default: 0, min: 0 },
    predictedNext14Days: { type: Number, default: 0, min: 0 },
    predictedNext30Days: { type: Number, default: 0, min: 0 },
    demandTrend: { type: String, enum: ["Increasing", "Stable", "Decreasing"], default: "Stable" },
    confidenceScore: { type: Number, default: 0.85, min: 0, max: 1 },
    suggestedReorderQty: { type: Number, default: 0, min: 0 },
    recommendedReorderDate: { type: String, default: "" },
    overstockRisk: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
    stockoutRisk: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Low" },
    modelLabel: { type: String, default: "DEMO Baseline Moving Average" },
    calculatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

forecastSchema.index({ storeId: 1, productId: 1 });

export const Forecast = mongoose.models.Forecast || mongoose.model("Forecast", forecastSchema);
export default Forecast;
