import mongoose from "mongoose";

const { Schema } = mongoose;

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    module: { type: String, trim: true },
    subModule: { type: String, trim: true },
    machineCode: { type: String, trim: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    assignedToName: { type: String, trim: true },
    dueDate: { type: String, trim: true },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;
