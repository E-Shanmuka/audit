import express from "express";
import Machine from "../models/Machine.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const machines = await Machine.find().lean();
    const formattedMachines = machines.map(machine => ({
      ...machine,
      id: machine._id.toString(),
      department: machine.department || "",
    }));
    res.json({ machines: formattedMachines });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch machines." });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { name, code, department, description, location, type, status } = req.body;
    const machine = await Machine.create({ name, code, department, description, location, type, status });
    res.status(201).json({ machine: { ...machine.toObject(), id: machine._id.toString(), department: machine.department || "" } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create machine." });
  }
});

router.patch("/update/:id", async (req, res) => {
  try {
    const machine = await Machine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!machine) return res.status(404).json({ message: "Machine not found." });
    res.json({ machine });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update machine." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const machine = await Machine.findByIdAndDelete(req.params.id);
    if (!machine) return res.status(404).json({ message: "Machine not found." });
    res.json({ message: "Machine deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete machine." });
  }
});

export default router;
