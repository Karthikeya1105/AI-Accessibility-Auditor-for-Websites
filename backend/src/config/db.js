import mongoose from 'mongoose';

let isMongoConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/accessibility_auditor';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    isMongoConnected = true;
    console.log(`[MongoDB] Successfully connected to database: ${uri}`);
  } catch (err) {
    isMongoConnected = false;
    console.warn(`[MongoDB] Connection notice: ${err.message}. Defaulting to disk JSON fallback storage mode.`);
  }
};

export const isDatabaseConnected = () => isMongoConnected;
