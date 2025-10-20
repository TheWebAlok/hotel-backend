import express from "express";
import multer from "multer";
import Event from "../models/Event.js";

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Create Event with image upload
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, date, location, description } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";
    const newEvent = new Event({
      title,
      date,
      location,
      description,
      imageUrl,
    });
    await newEvent.save();
    res
      .status(201)
      .json({ message: "Event created successfully", event: newEvent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while creating event" });
  }
});

// Get All Events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching events" });
  }
});

// Get Event by ID
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching event" });
  }
});

// Update Event
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, date, location, description } = req.body;
    let updatedData = { title, date, location, description };

    if (req.file) {
      updatedData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedEvent)
      return res.status(404).json({ message: "Event not found" });

    res
      .status(200)
      .json({ message: "Event updated successfully", event: updatedEvent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating event" });
  }
});

// Delete Event
router.delete("/:id", async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent)
      return res.status(404).json({ message: "Event not found" });
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while deleting event" });
  }
});

export default router;
