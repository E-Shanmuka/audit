import express from "express";
import Module from "../models/Module.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const modules = await Module.find().lean();
    res.json({ modules });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch modules." });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { name, description, icon, subModules } = req.body;
    const module = await Module.create({ name, description, icon, subModules });
    res.status(201).json({ module });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create module." });
  }
});

router.patch("/update/:id", async (req, res) => {
  try {
    const module = await Module.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!module) return res.status(404).json({ message: "Module not found." });
    res.json({ module });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update module." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const module = await Module.findByIdAndDelete(req.params.id);
    if (!module) return res.status(404).json({ message: "Module not found." });
    res.json({ message: "Module deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete module." });
  }
});

export default router;
