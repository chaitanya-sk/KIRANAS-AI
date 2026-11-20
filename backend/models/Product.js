import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productId: { type: String, default: () => `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, index: true },
    sku: { type: String, default: () => `SKU-${Date.now().toString().slice(-6)}`, index: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: "Local FMCG" },
    category: { type: String, default: "Staples & Grains" },
    subcategory: { type: String, default: "" },
    barcode: { type: String, default: "" },
    mrp: { type: Number, default: 0, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    purchaseCost: { type: Number, default: 0, min: 0 },
    purchasePrice: { type: Number, default: 0, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    profitMargin: { type: Number, default: 0 }, // in percentage
    unit: { type: String, default: "pcs" },
    packageSize: { type: String, default: "" },
    supplier: { type: String, default: "Shree Ram FMCG Distributors" },
    supplierId: { type: String, default: "", index: true },
    expiryDate: { type: String, default: "2027-12-31" },
    shelfLife: { type: String, default: "" },
    reorderLevel: { type: Number, default: 10, min: 0 },
    safetyStock: { type: Number, default: 5, min: 0 },
    minStock: { type: Number, default: 5, min: 0 },
    minStockLevel: { type: Number, default: 5, min: 0 },
    maxStock: { type: Number, default: 50, min: 0 },
    dailySales: { type: Number, default: 0, min: 0 },
    leadTime: { type: Number, default: 2, min: 1 },
    lastSaleDays: { type: Number, default: 0, min: 0 },
    productStatus: { type: String, enum: ["Active", "Discontinued", "Seasonal"], default: "Active" },
    isDeadStock: { type: Boolean, default: false }
  },
  { timestamps: true, strict: false }
);

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
