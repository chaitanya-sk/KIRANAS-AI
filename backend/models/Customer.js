import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true, unique: true, index: true },
    storeId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    village: { type: String, default: "" },
    khataBalance: { type: Number, default: 0 }, // Credit balance owed
    totalVisits: { type: Number, default: 1 },
    totalSpend: { type: Number, default: 0 },
    purchaseHistorySummary: { type: String, default: "Regular buyer of daily staples" },
    registrationDate: { type: String, default: "2024-02-01" }
  },
  { timestamps: true }
);

export const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);
export default Customer;
