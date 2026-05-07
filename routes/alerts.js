import express from "express";
import AlertRule from "../models/AlertRule.js";
import { auth } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const alerts = await AlertRule.find().lean();
    res.json({ alerts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch alert rules." });
  }
});

router.post("/create", auth, isAdmin, async (req, res) => {
  try {
    const { machineCode, module, subModule, department, isActive } = req.body;
    const alert = await AlertRule.create({ machineCode, module, subModule, department, isActive });
    res.status(201).json({ alert });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create alert rule." });
  }
});

router.patch("/update/:id", auth, isAdmin, async (req, res) => {
  try {
    const alert = await AlertRule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!alert) return res.status(404).json({ message: "Alert rule not found." });
    res.json({ alert });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update alert rule." });
  }
});

router.delete("/:id", auth, isAdmin, async (req, res) => {
  try {
    const alert = await AlertRule.findByIdAndDelete(req.params.id);
    if (!alert) return res.status(404).json({ message: "Alert rule not found." });
    res.json({ message: "Alert rule deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete alert rule." });
  }
});

export default router;
