// src/config/env.js
require("dotenv").config();

function required(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 4000,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  // Database
  MONGODB_URI: required("MONGODB_URI"),

  // Development/Frontend
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:4000",

  // JWT
  JWT_SECRET: required("JWT_SECRET"),

  // Google OAuth
  GOOGLE_CLIENT_ID: required("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: required("GOOGLE_CLIENT_SECRET"),
  GOOGLE_OAUTH_REDIRECT:
    process.env.GOOGLE_OAUTH_REDIRECT ||
    "http://localhost:4000/api/auth/google/callback",
};

module.exports = { env };
