import mongoose from "mongoose";

const uri = process.env.MONGODB_URI ?? "";
// ponytail: single cached connection, no connection pool tuning until traffic demands it
const g = global as unknown as { _mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } };
if (!g._mongoose) g._mongoose = { conn: null, promise: null };

export default async function db() {
  const c = g._mongoose!;
  if (c.conn) return c.conn;
  if (!c.promise) c.promise = mongoose.connect(uri, { dbName: "price_calc" });
  c.conn = await c.promise;
  return c.conn;
}
