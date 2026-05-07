import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";
import User from "../models/User.js";
import Machine from "../models/Machine.js";
import Department from "../models/Department.js";
import Issue from "../models/Issue.js";

const router = express.Router();
router.use(auth, isAdmin);

router.get("/modules", (req, res) => {
  res.json({
    modules: [
      { id: "safety", name: "Safety Modules" },
      { id: "assets", name: "Asset Management" },
      { id: "reports", name: "Reports" },
    ],
  });
});

router.get("/submodules", (req, res) => {
  res.json({
    submodules: [
      { id: "checklists", name: "Checklists" },
      { id: "audits", name: "Audits" },
      { id: "issues", name: "Issues" },
    ],
  });
});

router.get("/machines", async (req, res) => {
  const machines = await Machine.find();
  res.json({ machines });
});

router.get("/users", async (req, res) => {
  const users = await User.find().select("-password");
  res.json({ users });
});

router.get("/checklists", (req, res) => {
  res.json({
    checklists: [
      { id: "c1", name: "Daily Safety Checklist" },
      { id: "c2", name: "Machine Inspection" },
    ],
  });
});

router.post("/users", async (req, res) => {
  try {
    const { name, email, password, employeeCode, mobile, role, departmentId, accessRole } = req.body;

    if (!name || !email || !password || !employeeCode || !role) {
      return res.status(400).json({ message: "Name, email, password, employeeCode and role are required." });
    }

    if (role === "department" && !departmentId) {
      return res.status(400).json({ message: "Department users must include departmentId." });
    }

    const user = await User.create({
      name,
      email,
      password,
      employeeCode,
      mobile,
      role,
      departmentId,
      accessRole,
    });

    return res.status(201).json({ user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create user." });
  }
});

router.get("/departments", async (req, res) => {
  const departments = await Department.find();
  res.json({ departments });
});

export default router;
