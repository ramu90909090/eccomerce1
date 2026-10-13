const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access Denied: Authentication token missing"
    });
  }

  try {
    const secret = process.env.JWT_SECRET || "fallback_default_secret_key_2026";
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired session token. Please log in again."
    });
  }
};