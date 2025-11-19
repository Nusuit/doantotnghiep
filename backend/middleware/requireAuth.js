const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({
      success: false,
      code: "ERR_NO_TOKEN",
      message: "No token provided",
    });
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      code: "ERR_INVALID_TOKEN",
      message: "Invalid or expired token",
    });
  }
}

module.exports = requireAuth;
