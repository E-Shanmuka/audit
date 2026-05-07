import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await User.find().lean();
    const formattedUsers = users.map(user => ({
      ...user,
      id: user._id.toString(),
      department: user.department || "",
      employeeId: user.employeeCode,
      phone: user.mobile || undefined,
      password: undefined,
    }));
    res.json({ users: formattedUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users." });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { name, email, password, employeeId, phone, role, department, departmentId, accessRole, active } = req.body;
    const user = await User.create({
      name,
      email,
      password,
      employeeCode: employeeId,
      mobile: phone,
      role,
      department,
      active: active !== undefined ? active : true,
      departmentId: departmentId || null,
      accessRole,
    });
    res.status(201).json({ user: { ...user.toObject(), id: user._id.toString(), password: undefined, department: user.department || "" } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create user." });
  }
});

router.patch("/update/:id", async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.employeeId !== undefined) {
      data.employeeCode = data.employeeId;
      delete data.employeeId;
    }
    if (data.phone !== undefined) {
      data.mobile = data.phone;
    }
    const user = await User.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true }).lean();
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: { ...user, id: user._id.toString(), employeeId: user.employeeCode, password: undefined, department: user.department || "" } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update user." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ message: "User deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete user." });
  }
});

export default router;
