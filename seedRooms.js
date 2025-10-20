import mongoose from "mongoose";
import dotenv from "dotenv";
import Room from "./models/Room.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("🌱 Seeding Rooms...");
    await Room.deleteMany();

    const rooms = [
      { name: "Deluxe King Room", price: 3500, capacity: 2, image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800" },
      { name: "Family Suite", price: 5000, capacity: 4, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800" },
      { name: "Single Standard Room", price: 2200, capacity: 1, image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800" }
    ];

    await Room.insertMany(rooms);
    console.log("Rooms Added Successfully!");
    mongoose.connection.close();
  })
  .catch(err => console.error("Error:", err));
