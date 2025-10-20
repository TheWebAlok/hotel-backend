// routes/orderRoutes.js
import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

/* ------------------ CREATE ORDER ------------------ */
router.post("/", async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items in the order" });
    }

    // Calculate total price
    const totalPrice = items.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );

    const order = new Order({ items, totalPrice });
    const savedOrder = await order.save();

    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ------------------ GET ALL ORDERS ------------------ */
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Fetching orders error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ------------------ UPDATE ORDER ------------------ */
router.put("/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items in the order" });
    }

    const totalPrice = items.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { items, totalPrice },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (err) {
    console.error("Order update error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ------------------ DELETE ORDER ------------------ */
router.delete("/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ message: "Order canceled successfully" });
  } catch (err) {
    console.error("Order deletion error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
