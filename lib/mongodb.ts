import mongoose from 'mongoose';

// Cache the connection (global for dev, works in production too)
// In serverless environments, we need to be careful with global variables
declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    const error = 'Please define MONGODB_URI in your environment variables';
    console.error('❌', error);
    throw new Error(error);
  }

  let cached = global.mongoose as { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
  
  // If connection exists and is ready, return it
  if (cached.conn) {
    // Check if connection is still alive
    if (mongoose.connection.readyState === 1) {
      return cached.conn;
    } else {
      // Connection is dead, reset it
      console.warn('⚠️ MongoDB connection dead, resetting...');
      cached.conn = null;
      cached.promise = null;
    }
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 10000, // Increased to 10 seconds for serverless
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      // Additional options for serverless environments
      retryWrites: true,
      retryReads: true,
    };

    console.log('🔄 Attempting MongoDB connection...');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB connection error:', {
        message: error?.message,
        name: error?.name,
        code: error?.code,
      });
      cached.promise = null; // Reset promise on error
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    console.error('❌ Failed to establish MongoDB connection:', {
      message: e?.message,
      name: e?.name,
      code: e?.code,
    });
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}