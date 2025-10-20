const express = require("express");
const router = express.Router();
const Room = require("../models/Room");

// GET all rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 }); // latest first
    res.json(rooms); // return array directly
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching rooms", error: err.message });
  }
});

// GET single room by ID
router.get("/:id", async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    res.json(room); // return room object directly
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching room", error: err.message });
  }
});

// Add new room
router.post("/", async (req, res) => {
  try {
    const { roomNumber, roomType, price, description, imageUrl } = req.body;

    if (!roomNumber || !roomType || !price || !description || !imageUrl) {
      return res
        .status(400)
        .json({ message: "All fields including imageUrl are required" });
    }

    const existing = await Room.findOne({ roomNumber });
    if (existing) {
      return res.status(400).json({ message: "Room number already exists" });
    }

    const newRoom = new Room({
      roomNumber,
      roomType,
      price,
      description,
      imageUrl,
    });
    const savedRoom = await newRoom.save();

    res.status(201).json(savedRoom);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding room", error: err.message });
  }
});

//Update room (without changing image)

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

    // Update image if new file uploaded
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

module.exports = router;
