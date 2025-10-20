import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import Room from "../models/Room.js";

dotenv.config();
const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper: upload to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "hotel-rooms" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

// Add new room with image
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { roomNumber, roomType, price, description } = req.body;
    if (!roomNumber || !roomType || !price || !description || !req.file)
      return res
        .status(400)
        .json({ message: "All fields including image are required" });

    const existing = await Room.findOne({ roomNumber });
    if (existing)
      return res.status(400).json({ message: "Room number already exists" });

    const uploadResult = await uploadToCloudinary(req.file.buffer);

    const newRoom = new Room({
      roomNumber,
      roomType,
      price,
      description,
      imageUrl: uploadResult.secure_url,
    });

    const savedRoom = await newRoom.save();
    res.status(201).json(savedRoom);
  } catch (err) {
    console.error("Error adding room:", err);
    res.status(500).json({ message: "Error adding room", error: err.message });
  }
});

// Get all rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching rooms" });
  }
});

// Get single room by ID
router.get("/:id", async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ success: true, room });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching room", error: err.message });
  }
});

// Update room (with optional new image)
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { roomNumber, roomType, price, description } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Update text fields
    room.roomNumber = roomNumber || room.roomNumber;
    room.roomType = roomType || room.roomType;
    room.price = price || room.price;
    room.description = description || room.description;

    // Update image if a new file is uploaded
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      room.imageUrl = uploadResult.secure_url;
    }

    await room.save();
    res.json({ success: true, room });
  } catch (err) {
    console.error("Error updating room:", err);
    res
      .status(500)
      .json({ message: "Error updating room", error: err.message });
  }
});

// Delete room
router.delete("/:id", async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error deleting room", error: err.message });
  }
});

export default router;
