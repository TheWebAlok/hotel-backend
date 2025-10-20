// routes/menuRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import MenuItem from "../models/MenuItem.js";

const router = express.Router();

// ES module __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer storage with auto-create folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* ------------------ CREATE ------------------ */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const newItem = new MenuItem({ name, price, description, image });
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error("Menu save error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ------------------ READ ALL ------------------ */
router.get("/", async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("Menu fetch error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ------------------ READ ONE (for Edit) ------------------ */
router.get("/:id", async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });
    res.json(item);
  } catch (err) {
    console.error("Fetch by ID error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ------------------ UPDATE ------------------ */
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, price, description } = req.body;

    const updateData = { name, price, description };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedItem)
      return res.status(404).json({ message: "Menu item not found" });

    res.json(updatedItem);
  } catch (err) {
    console.error("Menu update error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ------------------ DELETE ------------------ */
router.delete("/:id", async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });

    // Optionally delete image file
    if (item.image) {
      const imagePath = path.join(__dirname, "..", item.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ message: "Menu item deleted successfully" });
  } catch (err) {
    console.error("Menu delete error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
