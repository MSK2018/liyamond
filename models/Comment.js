import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    authorName: { type: String, required: true, trim: true, maxlength: 100 },
    username: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, lowercase: true, trim: true, maxlength: 160, default: undefined },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    targetType: { type: String, enum: ["post", "product"], required: true, index: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
  },
  { timestamps: true },
);

commentSchema.index({ status: 1, createdAt: -1 });

if (mongoose.models.Comment?.schema.path("email")?.options.required) {
  mongoose.deleteModel("Comment");
}

export default mongoose.models.Comment || mongoose.model("Comment", commentSchema);
