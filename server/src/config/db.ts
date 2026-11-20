import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pradeep_vegetables';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000 // Fast 2-second timeout for local dev/demo
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error: any) {
    console.warn(`[MongoDB] Note: MongoDB not connected (${error.message}). Running with high-performance in-memory persistence mode for development.`);
    return false;
  }
};
