import mongoose from "mongoose";

const { Schema } = mongoose;

const permitSchema = new Schema(
  {
    permitNumber: { type: String, required: true, unique: true },
    templateId: { type: Schema.Types.ObjectId, ref: "PermitTemplate", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    data: { type: Schema.Types.Mixed, required: true }, // JSON data of the form
    status: { type: String, required: true, enum: ["pending", "approved", "rejected"], default: "pending" },
    currentDepartmentIndex: { type: Number, default: 0 }, // index in approvalFlow
    rejectedBy: { type: Schema.Types.ObjectId, ref: "Department" }, // if rejected
    rejectionReason: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const Permit = mongoose.model("Permit", permitSchema);
export default Permit;