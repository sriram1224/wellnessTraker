const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true }, // unique across providers
    passwordHash: { type: String, default: null }, // null if Google signup, hash if local
    provider: { type: String, default: "local" }, // "local", "google"
    name: { type: String, default: "" },
    avatar: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
