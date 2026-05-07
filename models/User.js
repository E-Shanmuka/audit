import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    employeeCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    mobile: { type: String, trim: true },
    role: { type: String, required: true, enum: ["admin", "user", "department", "supervisor", "auditor"], default: "user" },
    department: { type: String, trim: true },
    active: { type: Boolean, default: true },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: function () {
        return this.role === "department";
      },
    },
    accessRole: { type: String, default: "standard" },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
