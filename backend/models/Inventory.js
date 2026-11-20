import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    inventoryId: { type: String, required: true, unique: true, index: true },
    storeId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    sku: { type: String, required: true },
    availableQuantity: { type: Number, required: true, min: 0, default: 0 },
    reservedQuantity: { type: Number, default: 0, min: 0 },
    damagedQuantity: { type: Number, default: 0, min: 0 },
    reorderLevel: { type: Number, default: 10, min: 0 },
    maxStock: { type: Number, default: 100, min: 0 },
    stockValue: { type: Number, default: 0, min: 0 }, // availableQuantity * purchaseCost
    lastRestockDate: { type: String, default: "" },
    expiryDate: { type: String, default: "" },
    batchNumber: { type: String, default: "" },
    stockStatus: {
      type: String,
      enum: ["Normal", "Low Stock", "Critical", "Overstock", "Dead Stock", "Near Expiry", "Stocked Out"],
      default: "Normal"
    }
  },
  { timestamps: true }
);

inventorySchema.index({ storeId: 1, productId: 1 }, { unique: true });

export const Inventory = mongoose.models.Inventory || mongoose.model("Inventory", inventorySchema);
export default Inventory;
