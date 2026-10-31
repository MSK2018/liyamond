import "server-only";
import mongoose from "mongoose";

const globalForMongoose = globalThis;

const mongooseCache =
  globalForMongoose.mongooseCache ??
  (globalForMongoose.mongooseCache = { connection: null, promise: null });

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to .env.local before using the database.",
    );
  }

  if (mongooseCache.connection) {
    return mongooseCache.connection;
  }

  if (!mongooseCache.promise) {
    mongooseCache.promise = mongoose.connect(uri).catch((error) => {
      mongooseCache.promise = null;
      throw error;
    });
  }

  mongooseCache.connection = await mongooseCache.promise;
  return mongooseCache.connection;
}
