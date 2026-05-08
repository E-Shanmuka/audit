import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { isUser } from "../middlewares/roleMiddleware.js";
import Audit from "../models/Audit.js";

const router = express.Router();
router.use(auth, isUser);

// GET all audits
router.get("/", async (req, res) => {
  try {
    const { checklistId, machineCode, userId, auditDate } = req.query;
    let query = {};
    if (checklistId) query.checklistId = checklistId;
    if (machineCode) query.machineCode = machineCode;
    if (userId) query.userId = userId;
    if (auditDate) {
      const start = new Date(auditDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      query.auditDate = { $gte: start, $lt: end };
    }
    const audits = await Audit.find(query).sort({ createdAt: -1 });
    res.json(audits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch audits." });
  }
});

// POST create new audit
router.post("/create", async (req, res) => {
  try {
    const {
      checklistId,
      checklistTitle,
      module,
      subModule,
      machineCode,
      userId,
      userName,
      answers,
      status,
      auditDate,
    } = req.body;

    const audit = await Audit.create({
      checklistId,
      checklistTitle,
      module,
      subModule,
      machineCode,
      userId,
      userName,
      answers,
      status,
      auditDate: new Date(), // Always use current date/time when audit is submitted
    });

    res.status(201).json(audit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create audit.", error: error.message });
  }
});

// PATCH update audit
router.patch("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, status } = req.body;

    const audit = await Audit.findByIdAndUpdate(
      id,
      { answers, status },
      { new: true }
    );

    if (!audit) return res.status(404).json({ message: "Audit not found." });
    res.json(audit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update audit.", error: error.message });
  }
});

// DELETE audit
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const audit = await Audit.findByIdAndDelete(id);

    if (!audit) return res.status(404).json({ message: "Audit not found." });
    res.json({ message: "Audit deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete audit.", error: error.message });
  }
});

export default router;
