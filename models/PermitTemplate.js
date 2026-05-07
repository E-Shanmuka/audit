import mongoose from "mongoose";

const { Schema } = mongoose;

const questionSchema = new Schema({
  type: { type: String, required: true, enum: ["checkbox", "text", "dropdown", "signature", "date"] },
  question: { type: String, required: true },
  options: [{ type: String }], // for dropdown
  required: { type: Boolean, default: false },
});

const sectionSchema = new Schema({
  title: { type: String, required: true },
  questions: [questionSchema],
});

const permitTemplateSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    sections: [sectionSchema],
    approvalFlow: [{ type: Schema.Types.ObjectId, ref: "Department" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const PermitTemplate = mongoose.model("PermitTemplate", permitTemplateSchema);
export default PermitTemplate;