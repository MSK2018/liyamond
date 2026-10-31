import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ["online"], default: "online" },
    status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    transactionId: { type: String, trim: true, default: "" },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
