// src/config/db.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const express = require("express");

dotenv.config();

async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI); // modern Mongoose, URI is enough
  console.log("MongoDB connected");
}

module.exports = { connectDB };
