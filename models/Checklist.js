import mongoose from "mongoose";

const { Schema } = mongoose;

const questionSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    required: { type: Boolean, default: false },
    options: { type: [String], default: [] },
  },
  { _id: false }
);

const checklistSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    module: { type: String, required: true, trim: true },
    subModule: { type: String, required: true, trim: true },
    machineCode: { type: String, trim: true },
    department: { type: String, trim: true },
    questions: { type: [questionSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Checklist = mongoose.model("Checklist", checklistSchema);
export default Checklist;
