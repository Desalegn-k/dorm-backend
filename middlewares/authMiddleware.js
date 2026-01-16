const jwt = require("jsonwebtoken");

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  // Token can come from Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    req.user = decoded; // attach decoded payload to request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
