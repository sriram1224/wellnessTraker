const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { sign } = require("../utils/jwt");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  let user = await User.findOne({ email });
  if (user) {
    // Already registered by Google
    if (user.provider === "google" && !user.passwordHash) {
      return res.status(409).json({
        error:
          "Account exists with Google login. Log in with Google and set a password in your profile if you want email login.",
      });
    }
    return res.status(409).json({ error: "Email already in use." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  user = await User.create({
    email,
    passwordHash,
    provider: "local",
    name: name || "",
  });
  const token = sign(user);

  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      provider: user.provider,
    },
  });
});

/**
 * Email/Password Login
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  const user = await User.findOne({ email });

  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  if (user.provider === "google" && !user.passwordHash) {
    return res
      .status(401)
      .json({ error: "Use Google login for this account." });
  }

  const ok = await bcrypt.compare(password, user.passwordHash || "");
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = sign(user);

  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      provider: user.provider,
    },
  });
});

module.exports = router;
