import mongoose from "mongoose";
import dotenv from "dotenv";
import Booking from "./models/Booking.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("🌱 Seeding Bookings...");
    await Booking.deleteMany();

    const bookings = [
      { name: "Alice", email: "alice@example.com", roomId: "ROOM_ID_1", checkIn: "2025-10-20", checkOut: "2025-10-22" },
      { name: "Bob", email: "bob@example.com", roomId: "ROOM_ID_2", checkIn: "2025-10-21", checkOut: "2025-10-23" }
    ];

    await Booking.insertMany(bookings);
    console.log("Bookings Added Successfully!");
    mongoose.connection.close();
  })
  .catch(err => console.error("Error:", err));
