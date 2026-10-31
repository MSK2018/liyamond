import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 200 },
    excerpt: { type: String, trim: true, maxlength: 500 },
    content: { type: String, required: true, trim: true },
    coverImage: { type: String, trim: true, default: "" },
    author: { type: String, trim: true, maxlength: 100, default: "مدیر" },
    isPublished: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

postSchema.index({ isPublished: 1, createdAt: -1 });

export default mongoose.models.Post || mongoose.model("Post", postSchema);
