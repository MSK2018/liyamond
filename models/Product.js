import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 180,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
    priceToman: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isSafeInteger,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
      validate: Number.isSafeInteger,
    },
    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

productSchema.index({ isActive: 1, createdAt: -1 });

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
