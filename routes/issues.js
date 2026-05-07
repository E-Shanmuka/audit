import express from "express";
import Issue from "../models/Issue.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const issues = await Issue.find({}).lean();
    res.json({ issues });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch issues." });
  }
});

router.post("/create", async (req, res) => {
  try {
    const {
      title,
      description,
      departmentId,
      department,
      machineCode,
      severity,
      status,
      dueDate,
      reportedByName,
      assignedTo,
      auditId,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required." });
    }

    const issue = await Issue.create({
      title,
      description,
      departmentId,
      department,
      machineCode,
      severity: severity || "medium",
      status: status || "open",
      dueDate,
      reportedByName,
      assignedTo,
      auditId,
    });

    res.status(201).json({ issue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create issue." });
  }
});

router.patch("/update/:id", async (req, res) => {
  try {
    const issue = await Issue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!issue) {
      return res.status(404).json({ message: "Issue not found." });
    }

    res.json({ issue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update issue." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found." });
    }
    res.json({ message: "Issue deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete issue." });
  }
});

export default router;
