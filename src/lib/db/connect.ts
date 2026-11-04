import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mithaiboxes';

// Cached connection for Next.js hot-reload compatibility
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache;
}

const cache: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cache.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((client) => {
        console.log('[MongoDB] Connected successfully');
        return client;
      })
      .catch((err) => {
        cache.promise = null;
        console.error('[MongoDB] Connection failed:', err.message);
        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

export default connectDB;
