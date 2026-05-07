import User from "../models/User.js";
import Issue from "../models/Issue.js";
import Machine from "../models/Machine.js";
import { signToken } from "../utils/jwt.js";
import LoginLog from "../models/LoginLog.js";

const sanitizeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  employeeCode: user.employeeCode,
  mobile: user.mobile,
  department: user.department || "",
  departmentId: user.departmentId,
  accessRole: user.accessRole,
});

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken({
      userId: user._id,
      role: user.role,
      departmentId: user.departmentId,
    });

    await LoginLog.create({
      userId: user._id,
      email: user.email,
      role: user.role,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    const response = {
      token,
      role: user.role,
      user: sanitizeUser(user),
    };

    if (user.role === "department") {
      const [issues, machines, departmentUsers] = await Promise.all([
        Issue.find({ departmentId: user.departmentId }),
        Machine.find({ departmentId: user.departmentId }),
        User.find({ departmentId: user.departmentId }).select("-password"),
      ]);

      response.departmentData = {
        issues,
        machines,
        users: departmentUsers,
      };
    }

    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Login failed. Please try again later." });
  }
};
