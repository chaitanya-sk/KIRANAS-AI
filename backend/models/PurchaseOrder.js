import mongoose from "mongoose";

const purchaseOrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, default: () => `po_${Date.now()}`, index: true },
    poNumber: { type: String, default: () => `PO-2026-${Math.floor(100 + Math.random() * 900)}` },
    storeId: { type: String, default: "store_01", index: true },
    supplierId: { type: String, default: "sup_01", index: true },
    supplier: { type: String, default: "Shree Ram FMCG Distributors" },
    supplierName: { type: String, default: "Shree Ram FMCG Distributors" },
    items: [
      {
        productId: { type: String, required: true },
        sku: { type: String, default: "" },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        total: { type: Number, required: true, min: 0 }
      }
    ],
    total: { type: Number, default: 0, min: 0 },
    totalOrderValue: { type: Number, default: 0, min: 0 },
    orderDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
    expectedDelivery: { type: String, default: "In 2-3 business days" },
    expectedDeliveryDate: { type: String, default: "In 2-3 business days" },
    actualDeliveryDate: { type: String, default: "" },
    status: { type: String, default: "Pending" },
    orderStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "In Transit", "Delivered", "Cancelled"],
      default: "Pending"
    },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid", "Partially Paid", "Net-15 Credit"],
      default: "Unpaid"
    },
    notes: { type: String, default: "" }
  },
  { timestamps: true, strict: false }
);

export const PurchaseOrder = mongoose.models.PurchaseOrder || mongoose.model("PurchaseOrder", purchaseOrderSchema);
export default PurchaseOrder;
