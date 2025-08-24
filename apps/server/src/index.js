require("dotenv").config(); // Always load env vars first!

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const corsMiddleware = require("./config/cors");

const app = express();

// --- Connect DB ---
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// --- Middleware ---
app.use(corsMiddleware); // Custom CORS config, or change to app.use(cors()) if not needed
app.use(express.json());
app.use(cookieParser());

// --- Healthcheck route ---
app.get("/health", (_req, res) => res.json({ ok: true }));

// --- Auth routes ---
app.use("/api/auth", require("./routes/auth"));
app.use("/api/google", require("./routes/google"));

// --- 404 and error handling ---
app.use((_req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

// --- Listen exactly once! ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
