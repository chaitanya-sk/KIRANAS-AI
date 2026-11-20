import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    supplierId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, default: "Sales Lead" },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    district: { type: String, required: true },
    state: { type: String, required: true },
    suppliedBrands: [{ type: String }],
    suppliedCategories: [{ type: String }],
    avgDeliveryTime: { type: Number, default: 2, min: 1 }, // in days
    minOrderValue: { type: Number, default: 1000, min: 0 },
    rating: { type: Number, default: 4.5, min: 1, max: 5 },
    status: { type: String, enum: ["Active", "Inactive", "Preferred"], default: "Active" }
  },
  { timestamps: true }
);

export const Supplier = mongoose.models.Supplier || mongoose.model("Supplier", supplierSchema);
export default Supplier;
