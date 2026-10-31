import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  image: { type: String, default: "" },
  priceToman: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  guestName: { type: String, trim: true },
  address: {
    recipientName: { type: String, required: true },
    mobile: { type: String, required: true },
    province: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    address: { type: String, required: true },
  },
  items: { type: [orderItemSchema], required: true, default: [] },
  subtotal: { type: Number, required: true, min: 0 },
  shippingCost: { type: Number, required: true, min: 0, default: 0 },
  total: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, enum: ["online", "cod"], default: "cod" },
  status: { type: String, enum: ["pending", "paid", "processing", "shipped", "completed", "cancelled"], default: "pending" },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
