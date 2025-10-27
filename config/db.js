import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB connected successfully');
  } catch (err) {
    logger.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

//mongoose.set('debug', true);

export default connectDB;
