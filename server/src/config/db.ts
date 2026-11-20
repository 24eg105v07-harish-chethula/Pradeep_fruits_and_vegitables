import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI?.trim();

  if (!uri) {
    console.error('[MongoDB] MONGO_URI is missing. Set it to your MongoDB Atlas connection string in server/.env.');
    return false;
  }

  const directAtlasUri = uri.startsWith('mongodb+srv://')
    ? (() => {
        const match = uri.match(/^mongodb\+srv:\/\/([^@]+)@[^/]+\/([^?]+)(\?.*)?$/);
        if (!match) return null;
        const credentials = match[1];
        const database = match[2] || 'pradeep_vegetables';
        return `mongodb://${credentials}@ac-cjw9q7a-shard-00-00.azryhqi.mongodb.net:27017,ac-cjw9q7a-shard-00-01.azryhqi.mongodb.net:27017,ac-cjw9q7a-shard-00-02.azryhqi.mongodb.net:27017/${database}?replicaSet=atlas-cjw9q7a-shard-0&authSource=admin&tls=true&retryWrites=true&w=majority&serverSelectionTimeoutMS=15000`;
      })()
    : null;

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      retryWrites: true,
      w: 'majority'
    });

    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error: any) {
    if (directAtlasUri) {
      try {
        const conn = await mongoose.connect(directAtlasUri, {
          serverSelectionTimeoutMS: 15000,
          connectTimeoutMS: 15000,
          retryWrites: true,
          w: 'majority'
        });
        console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
        return true;
      } catch (fallbackError: any) {
        console.error('[MongoDB] Connection failed:', fallbackError.message);
        return false;
      }
    }

    console.error('[MongoDB] Connection failed:', error.message);
    return false;
  }
};
