const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

function sign(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function verify(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { sign, verify };
