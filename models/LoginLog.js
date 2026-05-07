import mongoose from "mongoose";

const { Schema } = mongoose;

const loginLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    role: { type: String, required: true, enum: ["admin", "user", "department"] },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

const LoginLog = mongoose.model("LoginLog", loginLogSchema);
export default LoginLog;
