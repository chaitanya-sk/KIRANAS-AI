import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    saleId: { type: String, required: true, unique: true, index: true },
    invoiceNumber: { type: String, default: "" },
    storeId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    sku: { type: String, default: "" },
    productName: { type: String, default: "" },
    saleDate: { type: String, required: true, index: true }, // ISO date string YYYY-MM-DD
    quantitySold: { type: Number, required: true, min: 1 },
    sellingPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    totalRevenue: { type: Number, required: true, min: 0 },
    costAmount: { type: Number, default: 0, min: 0 },
    profit: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: ["Cash", "UPI", "Khata"], default: "Cash" },
    customerId: { type: String, default: "" },
    customerName: { type: String, default: "Walk-in Customer" }
  },
  { timestamps: true }
);

export const Sale = mongoose.models.Sale || mongoose.model("Sale", saleSchema);
export default Sale;
