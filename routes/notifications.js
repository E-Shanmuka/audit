import express from "express";
import Notification from "../models/Notification.js";
import { auth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'admin') {
      // Admin can see all notifications
    } else if (req.user.role === 'department' && req.user.departmentId) {
      query.$or = [
        { userId: req.user._id.toString() },
        { departmentId: req.user.departmentId },
      ];
    } else {
      query.userId = req.user._id.toString();
    }
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).lean();
    res.json({ notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
});

router.post('/create', auth, async (req, res) => {
  try {
    const { userId, departmentId, title, message, type, read } = req.body;
    const notification = await Notification.create({ userId, departmentId, title, message, type, read: read ?? false });
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

router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found.' });
    res.json({ message: 'Notification deleted.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete notification.' });
  }
});

router.delete('/clear', auth, async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'admin') {
      // Admin can clear all notification history if needed
    } else if (req.user.role === 'department' && req.user.departmentId) {
      query.departmentId = req.user.departmentId;
    } else {
      query.userId = req.user._id.toString();
    }
    const result = await Notification.deleteMany(query);
    res.json({ deletedCount: result.deletedCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to clear notifications.' });
  }
});

export default router;
