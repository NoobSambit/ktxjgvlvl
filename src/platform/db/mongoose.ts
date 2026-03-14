import mongoose from "mongoose"
import { env } from "@/platform/validation/env"

declare global {
  var __indiaForBtsMongoose: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  } | undefined
}

const cached = global.__indiaForBtsMongoose ?? { conn: null, promise: null }

if (!global.__indiaForBtsMongoose) {
  global.__indiaForBtsMongoose = cached
}

export async function connectToDatabase() {
  if (!env.MONGODB_URI) {
    return null
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(env.MONGODB_URI, {
      bufferCommands: false
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
