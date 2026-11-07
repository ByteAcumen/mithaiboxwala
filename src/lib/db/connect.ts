import mongoose from 'mongoose';
import { createClient } from '@tursodatabase/api';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mithaiboxes';
const TURSO_ORG = process.env.TURSO_ORG;
const TURSO_PLATFORM_TOKEN = process.env.TURSO_PLATFORM_TOKEN;
// Cached connection for Next.js hot-reload compatibility
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}
interface TursoCache {
  client: ReturnType<typeof createClient> | null;
  db: any | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache;
  var _tursoCache: TursoCache;
}

const cache: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;
// Initialize Turso cache on global if not exists
if (!global._tursoCache) {
  global._tursoCache = { client: null, db: null };
}
const tursoCache: TursoCache = global._tursoCache ?? { client: null, db: null };
global._tursoCache = tursoCache;
// Default to MongoDB; switch to Turso if TURSO_ORG is set
export const dbType = TURSO_ORG ? 'turso' : 'mongodb';

export async function connectDB(): Promise<typeof mongoose> {
  if (dbType === 'turso') {
    // Turso - return a placeholder; actual DB accessed via tursoCache
    if (!tursoCache.client) {
      tursoCache.client = createClient({
        org: TURSO_ORG!,
        token: TURSO_PLATFORM_TOKEN!,
      });
      console.log('[Turso] Client initialized');
    }
    return mongoose.conn ?? { closed: false };
  }
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

export async function createUserDatabase(userId: string): Promise<any> {
  if (dbType !== 'turso') {
    throw new Error('createUserDatabase only supported with Turso');
  }
  
  if (!tursoCache.client) {
    tursoCache.client = createClient({
      org: TURSO_ORG!,
      token: TURSO_PLATFORM_TOKEN!,
    });
  }
  
  const db = await tursoCache.client.databases.create({
    name: `user-${userId}`,
    group: 'production',
  });
  
  tursoCache.db = db;
  console.log('[Turso] Created user database:', db.name);
  return db;
}

export async function getUserDatabase(userId: string): Promise<any> {
  if (dbType !== 'turso') {
    // Fall back to MongoDB for non-Turso setups
    return null;
  }
  
  if (!tursoCache.db) {
    // If no DB created yet, create a default one
    return await createUserDatabase(userId);
  }
  
  return tursoCache.db;
}

export default connectDB;

