import express from "express";
import Task from "../models/Task.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({}).lean();
    res.json({ tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch tasks." });
  }
});

router.post("/create", async (req, res) => {
  try {
    const {
      title,
      description,
      module,
      subModule,
      machineCode,
      assignedTo,
      assignedToName,
      dueDate,
      priority,
      status,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required." });
    }

    const task = await Task.create({
      title,
      description,
      module,
      subModule,
      machineCode,
      assignedTo,
      assignedToName,
      dueDate,
      priority: priority || "medium",
      status: status || "pending",
    });

    res.status(201).json({ task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create task." });
  }
});

router.patch("/update/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    res.json({ task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update task." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }
    res.json({ message: "Task deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete task." });
  }
});

export default router;
