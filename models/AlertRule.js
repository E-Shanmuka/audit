import mongoose from "mongoose";

const { Schema } = mongoose;

const alertRuleSchema = new Schema(
  {
    machineCode: { type: String, trim: true },
    module: { type: String, required: true, trim: true },
    subModule: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const AlertRule = mongoose.model("AlertRule", alertRuleSchema);
export default AlertRule;
