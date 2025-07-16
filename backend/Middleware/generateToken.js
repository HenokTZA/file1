
const jwt = require("jsonwebtoken");
require("dotenv").config();

async function generateToken(payload, tokenExpiry = "7d") {
  // Ensure access_level is included in the payload
  if (!payload.access_level) {
    throw new Error("Access level is required to generate a token.");
  }
  const token = jwt.sign(payload, process.env.JWT_TOKEN_KEY, {
    expiresIn: tokenExpiry,
  });
  return token;
}

module.exports = generateToken;
