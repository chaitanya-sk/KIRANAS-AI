import mongoose from "mongoose";

const logisticsSchema = new mongoose.Schema(
  {
    shipmentId: { type: String, required: true, unique: true, index: true },
    purchaseOrderId: { type: String, required: true, index: true },
    supplierId: { type: String, required: true },
    supplierName: { type: String, default: "" },
    storeId: { type: String, required: true, index: true },
    vehicleType: { type: String, default: "Mini Truck (Tata Ace)" },
    driverReference: { type: String, default: "Driver Ref" },
    dispatchDate: { type: String, required: true },
    expectedArrival: { type: String, required: true },
    actualArrival: { type: String, default: "" },
    deliveryStatus: {
      type: String,
      enum: ["Dispatched", "In Transit", "Delivered", "Delayed"],
      default: "In Transit"
    },
    transportCost: { type: Number, default: 0, min: 0 },
    distanceKm: { type: Number, default: 15, min: 0 }
  },
  { timestamps: true }
);

export const Logistics = mongoose.models.Logistics || mongoose.model("Logistics", logisticsSchema);
export default Logistics;
