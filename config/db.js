const mongoose = require("mongoose");
const logger = require("../utils/logger");
const env=require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info("MongoDB connected successfully");
  } catch (err) {
    logger.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
