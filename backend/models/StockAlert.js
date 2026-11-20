import mongoose from "mongoose";

const stockAlertSchema = new mongoose.Schema(
  {
    alertId: { type: String, required: true, unique: true, index: true },
    storeId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    sku: { type: String, default: "" },
    productName: { type: String, default: "" },
    alertType: {
      type: String,
      enum: [
        "Low Stock",
        "Critical Stock",
        "Stockout",
        "Overstock",
        "Dead Stock",
        "Near Expiry",
        "Expired",
        "Delayed Delivery"
      ],
      required: true
    },
    severity: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
    description: { type: String, required: true },
    currentQuantity: { type: Number, default: 0 },
    recommendedAction: { type: String, default: "" },
    alertStatus: { type: String, enum: ["Active", "Acknowledged", "Resolved"], default: "Active" },
    createdDate: { type: String, default: () => new Date().toISOString().split("T")[0] }
  },
  { timestamps: true }
);

export const StockAlert = mongoose.models.StockAlert || mongoose.model("StockAlert", stockAlertSchema);
export default StockAlert;
