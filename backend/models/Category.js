import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    categoryId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "Package" },
    subcategories: [{ type: String }]
  },
  { timestamps: true }
);

export const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
export default Category;
