import mongoose from "mongoose";

const { Schema } = mongoose;

const permitApprovalSchema = new Schema(
  {
    permitId: { type: Schema.Types.ObjectId, ref: "Permit", required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, required: true, enum: ["approved", "rejected"] },
    remarks: { type: String },
    approvedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const PermitApproval = mongoose.model("PermitApproval", permitApprovalSchema);
export default PermitApproval;