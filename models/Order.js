import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  items: [
    {
      menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
      name: String,
      price: Number,
      quantity: { type: Number, default: 1 },
    },
  ],
  totalPrice: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Order", OrderSchema);
