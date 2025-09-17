const jwt2 = require("jsonwebtoken");
const crypto = require("crypto");
const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 ngày
function signAccessToken(user) {
  return jwt2.sign(
    { id: user.id, email: user.email, roles: user.roles || ["USER"] },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}
function generateRefreshToken() {
  return crypto.randomBytes(32).toString("hex");
}

function generateTokens(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = generateRefreshToken();
  return { accessToken, refreshToken };
}

module.exports = {
  signAccessToken,
  generateRefreshToken,
  generateTokens,
  REFRESH_TOKEN_TTL_SECONDS,
};
