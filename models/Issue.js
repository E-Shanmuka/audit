import mongoose from "mongoose";

const { Schema } = mongoose;

const issueSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["open", "in-progress", "investigating", "resolved", "closed"],
      default: "open",
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
    department: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    reportedByName: { type: String, trim: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    machineCode: { type: String, trim: true },
    auditId: { type: String, trim: true },
    dueDate: { type: String, trim: true },
    resolvedBy: { type: String, trim: true },
    resolvedByName: { type: String, trim: true },
    resolvedAt: { type: String, trim: true },
  },
  { timestamps: true }
);

const Issue = mongoose.model("Issue", issueSchema);
export default Issue;
