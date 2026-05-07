import mongoose from "mongoose";

const { Schema } = mongoose;

const machineSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, unique: true },
    department: { type: String, trim: true },
    description: { type: String, trim: true },
    location: { type: String, trim: true },
    type: { type: String, trim: true },
    status: { type: String, enum: ["operational", "maintenance", "down"], default: "operational" },
  },
  { timestamps: true }
);

const Machine = mongoose.model("Machine", machineSchema);
export default Machine;
