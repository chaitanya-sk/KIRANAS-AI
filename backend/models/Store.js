import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    storeId: { type: String, required: true, unique: true, index: true },
    storeName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    village: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true },
    storeCategory: { type: String, default: "Rural Kirana" },
    registrationDate: { type: String, default: "2024-01-15" },
    totalProducts: { type: Number, default: 0 },
    storeStatus: { type: String, enum: ["Active", "Inactive", "Pending"], default: "Active" },
    isDemoStore: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Store = mongoose.models.Store || mongoose.model("Store", storeSchema);
export default Store;
