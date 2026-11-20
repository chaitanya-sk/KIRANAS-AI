import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: {
      type: String,
      required: function () {
        return !this.provider || this.provider === "local";
      }
    },
    profileImage: { type: String, default: "" },
    provider: {
      type: String,
      enum: ["local", "google", "apple", "facebook", "microsoft"],
      default: "local"
    },
    providerId: { type: String, default: "" },
    socialAccounts: [
      {
        provider: { type: String, required: true },
        providerId: { type: String, required: true },
        email: { type: String, default: "" },
        linkedAt: { type: Date, default: Date.now }
      }
    ],
    shopName: { type: String, default: "Shree Ram Kirana Store" },
    location: { type: String, default: "Mandi Market, Block B" },
    phone: { type: String, default: "+91 98765 43210" },
    role: { type: String, enum: ["retailer", "distributor", "admin"], default: "retailer" }
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
