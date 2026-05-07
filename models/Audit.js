import mongoose from "mongoose";

const { Schema } = mongoose;

const answerSchema = new Schema({
  questionId: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  remark: { type: String },
  editedBy: { type: String },
  editedAt: { type: Date },
}, { _id: false });

const auditSchema = new Schema(
  {
    checklistId: { type: String, required: true },
    checklistTitle: { type: String, required: true },
    module: { type: String, required: true },
    subModule: { type: String, required: true },
    machineCode: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    answers: [answerSchema],
    status: { type: String, enum: ["completed", "has_issues"], default: "completed" },
    auditDate: { type: Date },
  },
  { timestamps: true }
);

const Audit = mongoose.model("Audit", auditSchema);
export default Audit;
