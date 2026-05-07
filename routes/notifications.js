import express from "express";
import Notification from "../models/Notification.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).lean();
    res.json({ notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { userId, title, message, type, read } = req.body;
    const notification = await Notification.create({ userId, title, message, type, read: read ?? false });
    res.status(201).json({ notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create notification." });
  }
});

router.patch("/update/:id", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!notification) return res.status(404).json({ message: "Notification not found." });
    res.json({ notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update notification." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ message: "Notification not found." });
    res.json({ message: "Notification deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete notification." });
  }
});

export default router;
