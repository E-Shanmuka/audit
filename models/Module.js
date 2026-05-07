import mongoose from "mongoose";

const { Schema } = mongoose;

const subModuleSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
  },
  { _id: false }
);

const moduleSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    icon: { type: String, trim: true, default: "Layers" },
    subModules: { type: [subModuleSchema], default: [] },
  },
  { timestamps: true }
);

const Module = mongoose.model("Module", moduleSchema);
export default Module;
