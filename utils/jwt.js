import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "replace_this_production_secret";
const JWT_EXPIRES = process.env.JWT_EXPIRES || process.env.JWT_EXPIRE || "8h";

export const signToken = ({ userId, role, departmentId }) => {
  return jwt.sign({ userId, role, departmentId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
