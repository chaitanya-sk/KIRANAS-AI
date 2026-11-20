import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
    storeId: { type: String, required: true, index: true },
    customerId: { type: String, default: "" },
    customerName: { type: String, default: "Walk-in Retail Buyer" },
    invoiceNumber: { type: String, required: true, unique: true },
    products: [
      {
        productId: { type: String, required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        total: { type: Number, required: true, min: 0 }
      }
    ],
    totalBill: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["Cash", "UPI", "Khata"], default: "Cash" },
    transactionDate: { type: String, required: true, index: true }
  },
  { timestamps: true }
);

export const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);
export default Transaction;
