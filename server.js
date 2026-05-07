import path from "path";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import auditsRoutes from "./routes/audits.js";
import issueRoutes from "./routes/issues.js";
import taskRoutes from "./routes/tasks.js";
import usersRoutes from "./routes/users.js";
import departmentsRoutes from "./routes/departments.js";
import machinesRoutes from "./routes/machines.js";
import modulesRoutes from "./routes/modules.js";
import checklistsRoutes from "./routes/checklists.js";
import notificationsRoutes from "./routes/notifications.js";
import alertsRoutes from "./routes/alerts.js";
import permitsRoutes from "./routes/permits.js";
import permitTemplatesRoutes from "./routes/permitTemplates.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/industrial-safety";
const PORT = process.env.PORT || 5000;

mongoose.set("strictQuery", false);
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  });

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/audits", auditsRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/departments", departmentsRoutes);
app.use("/api/machines", machinesRoutes);
app.use("/api/modules", modulesRoutes);
app.use("/api/checklists", checklistsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/alerts", alertsRoutes);
app.use("/api/permits", permitsRoutes);
app.use("/api/permit-templates", permitTemplatesRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const distPath = path.resolve(process.cwd(), "dist");
app.use(express.static(distPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.get("/*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ message: "Route not found" });
  }

  return res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
