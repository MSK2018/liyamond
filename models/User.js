import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  recipientName: { type: String, trim: true, maxlength: 100 },
  mobile: { type: String, trim: true, maxlength: 20 },
  province: { type: String, trim: true, maxlength: 100 },
  city: { type: String, trim: true, maxlength: 100 },
  postalCode: { type: String, trim: true, maxlength: 20 },
  address: { type: String, trim: true, maxlength: 500 },
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 100 },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true, maxlength: 160 },
    mobile: { type: String, unique: true, sparse: true, trim: true, maxlength: 20 },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    address: { type: addressSchema, default: null },
    addresses: { type: [addressSchema], default: [] },
    cart: {
      type: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1, max: 999, default: 1 },
      }],
      default: [],
    },
  },
  { timestamps: true },
);

if (mongoose.models.User && (!mongoose.models.User.schema.path("email") || !mongoose.models.User.schema.path("role") || !mongoose.models.User.schema.path("address") || !mongoose.models.User.schema.path("addresses"))) {
  mongoose.deleteModel("User");
}

export default mongoose.models.User || mongoose.model("User", userSchema);
