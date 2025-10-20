import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  guestName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  roomType: { type: String, enum: ["Single", "Double", "Suite"], default: "Single" },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },

  // Link each booking to a user
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("Booking", bookingSchema);
