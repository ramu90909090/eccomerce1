// Restrict endpoint to authorized roles only (e.g. ['admin'], ['admin', 'manager'])
module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: Access restricted to [${allowedRoles.join(", ")}]` 
      });
    }
    next();
  };
};