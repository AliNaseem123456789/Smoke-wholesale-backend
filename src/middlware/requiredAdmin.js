const requireAdmin = (req, res, next) => {
  console.log("Middleware: Checking Admin Rights for:", req.user?.email);
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized: No user session" });
  }
  if (req.user.role === "ADMIN") {
    return next();
  }
  return res.status(403).json({
    error: "Forbidden: You do not have admin privileges",
  });
};
module.exports = requireAdmin;
