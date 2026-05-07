export const isAdmin = (req, res, next) => {
  if (req.user?.role === "admin") {
    return next();
  }

  return res.status(403).json({ message: "Admin access required." });
};

export const isUser = (req, res, next) => {
  if (req.user && ["admin", "user"].includes(req.user.role)) {
    return next();
  }

  return res.status(403).json({ message: "User access required." });
};

export const isDepartment = (req, res, next) => {
  if (req.user && ["admin", "department"].includes(req.user.role)) {
    return next();
  }

  return res.status(403).json({ message: "Department access required." });
};
