const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/user");
const { sign } = require("../utils/jwt");
require("dotenv").config();

const router = express.Router();

const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_OAUTH_REDIRECT,
});

// Step 1: Redirect user to Google OAuth
router.get("/google", (_req, res) => {
  const url = client.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile"],
    prompt: "consent",
  });
  res.redirect(url);
});

// Step 2: Google callback and login/merge logic
router.get("/google/callback", async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) throw new Error("No code returned from Google.");

    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // Check for email!
    const email = payload.email;
    if (!email) {
      const frontend = new URL(process.env.CORS_ORIGIN);
      frontend.hash = "error=account_has_no_email";
      return res.redirect(frontend.toString());
    }

    const name = payload.name || "";
    const picture = payload.picture || "";

    // Find user by email (merge accounts)
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        provider: "google",
        name,
        avatar: picture,
        passwordHash: null,
      });
    } else {
      if (user.provider !== "google") user.provider = "google";
      if (!user.name) user.name = name;
      if (!user.avatar) user.avatar = picture;
      await user.save();
    }

    const jwtToken = sign(user);
    const frontend = new URL(process.env.CORS_ORIGIN);
    frontend.hash = `token=${jwtToken}`;
    return res.redirect(frontend.toString());
  } catch (e) {
    // General error fallback: send the error message to the frontend
    console.error("Google OAuth error:", e.message || e);
    const frontend = new URL(process.env.CORS_ORIGIN);
    // Send a friendly error message but never the raw stack!
    const msg = encodeURIComponent(e.message || "Google login failed");
    frontend.hash = `error=${msg}`;
    res.redirect(frontend.toString());
  }
});

module.exports = router;
