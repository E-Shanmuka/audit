import express from "express";
import Department from "../models/Department.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const departments = await Department.find().lean();
    res.json({ departments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch departments." });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const department = await Department.create({ name, code, description });
    res.status(201).json({ department });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create department." });
  }
});

router.patch("/update/:id", async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!department) return res.status(404).json({ message: "Department not found." });
    res.json({ department });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update department." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ message: "Department not found." });
    res.json({ message: "Department deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete department." });
  }
});

export default router;
