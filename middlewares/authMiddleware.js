import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ message: "Missing authentication token." });
    }

    const decoded = verifyToken(token);

    if (!decoded?.userId) {
      return res.status(401).json({ message: "Invalid token payload." });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication failed:", error);
    return res.status(401).json({ message: "Authentication failed." });
  }
};
