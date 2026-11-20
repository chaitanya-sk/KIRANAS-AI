import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    promotionId: { type: String, required: true, unique: true, index: true },
    storeId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["Weekend Offer", "Festival Sale", "Bulk Discount", "Dead Stock Clearance"],
      default: "Weekend Offer"
    },
    discountPercent: { type: Number, required: true, min: 1, max: 80 },
    applicableProducts: [{ type: String }],
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    seasonalEvent: { type: String, default: "General Promotion" },
    status: { type: String, enum: ["Active", "Scheduled", "Expired"], default: "Active" }
  },
  { timestamps: true }
);

export const Promotion = mongoose.models.Promotion || mongoose.model("Promotion", promotionSchema);
export default Promotion;
