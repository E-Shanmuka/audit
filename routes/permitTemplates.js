import express from "express";
import PermitTemplate from "../models/PermitTemplate.js";
import { auth } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Get all templates
router.get("/", auth, async (req, res) => {
  try {
    const templates = await PermitTemplate.find({ active: true }).populate("createdBy", "name").sort({ createdAt: -1 });
    res.json({ templates });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch templates." });
  }
});

// Get template by id
router.get("/:id", auth, async (req, res) => {
  try {
    const template = await PermitTemplate.findById(req.params.id).populate("createdBy", "name");
    if (!template) return res.status(404).json({ message: "Template not found." });
    res.json({ template });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch template." });
  }
});

// Create template
router.post("/", auth, isAdmin, async (req, res) => {
  try {
    const { name, sections, approvalFlow } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Template name is required." });
    }

    if (!sections || sections.length === 0) {
      return res.status(400).json({ message: "At least one section is required." });
    }

    if (sections.some(s => !s.title || !s.title.trim())) {
      return res.status(400).json({ message: "All section titles must be filled in." });
    }

    if (!approvalFlow || approvalFlow.length === 0) {
      return res.status(400).json({ message: "At least one department must be in the approval flow." });
    }

    const template = await PermitTemplate.create({
      name,
      sections,
      approvalFlow,
      createdBy: req.user._id,
    });
    res.status(201).json({ template });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map(err => err.message)
        .join(', ');
      return res.status(400).json({ message: `Validation error: ${messages}` });
    }
    res.status(500).json({ message: "Failed to create template." });
  }
});

// Update template
router.patch("/:id", auth, isAdmin, async (req, res) => {
  try {
    const { name, sections, approvalFlow } = req.body;

    // Validation
    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ message: "Template name cannot be empty." });
    }

    if (sections && sections.some(s => !s.title || !s.title.trim())) {
      return res.status(400).json({ message: "All section titles must be filled in." });
    }

    if (approvalFlow && approvalFlow.length === 0) {
      return res.status(400).json({ message: "At least one department must be in the approval flow." });
    }

    const template = await PermitTemplate.findByIdAndUpdate(req.params.id, {
      name,
      sections,
      approvalFlow,
    }, { new: true, runValidators: true });
    if (!template) return res.status(404).json({ message: "Template not found." });
    res.json({ template });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map(err => err.message)
        .join(', ');
      return res.status(400).json({ message: `Validation error: ${messages}` });
    }
    res.status(500).json({ message: "Failed to update template." });
  }
});

// Delete template
router.delete("/:id", auth, isAdmin, async (req, res) => {
  try {
    const template = await PermitTemplate.findByIdAndUpdate(req.params.id, { active: false });
    if (!template) return res.status(404).json({ message: "Template not found." });
    res.json({ message: "Template deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete template." });
  }
});

// Duplicate template
router.post("/:id/duplicate", auth, isAdmin, async (req, res) => {
  try {
    const original = await PermitTemplate.findById(req.params.id);
    if (!original) return res.status(404).json({ message: "Template not found." });

    const template = await PermitTemplate.create({
      name: `${original.name} (Copy)`,
      sections: original.sections,
      approvalFlow: original.approvalFlow,
      createdBy: req.user._id,
    });
    res.status(201).json({ template });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to duplicate template." });
  }
});

export default router;
