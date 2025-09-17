const rateLimit = require("express-rate-limit");

// Simple rate limiter for APIs
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiRateLimiter,
};
