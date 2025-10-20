import express from "express";
import Booking from "../models/Booking.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Booking (User must be logged in)
router.post("/", protect, async (req, res) => {
  try {
    const { guestName, email, phone, roomType, checkIn, checkOut, guests } = req.body;
    const booking = new Booking({
      userId: req.user.id, // Logged-in user from JWT
      guestName,
      email,
      phone,
      roomType,
      checkIn,
      checkOut,
      guests,
    });
    const saved = await booking.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get My Bookings (Only logged-in user's bookings)
router.get("/mybookings", protect, async (req, res) => {
  try {
    const myBookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(myBookings);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get all bookings (Admin use)
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get single booking by ID
router.get("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update booking
router.put("/:id", async (req, res) => {
  try {
    const { guestName, email, phone, roomType, checkIn, checkOut, guests } = req.body;
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { guestName, email, phone, roomType, checkIn, checkOut, guests },
      { new: true }
    );
    if (!updatedBooking) return res.status(404).json({ error: "Booking not found" });
    res.json(updatedBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

//  Delete booking
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
