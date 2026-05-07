import mongoose from "mongoose";

const { Schema } = mongoose;

const departmentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, unique: true, uppercase: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

const Department = mongoose.model("Department", departmentSchema);
export default Department;
