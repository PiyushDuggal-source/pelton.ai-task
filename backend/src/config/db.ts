import mongoose from "mongoose";

export async function connectToDatabase(uri: string) {
  if (process.env.SKIP_DB === "true") {
    return;
  }
  if (!uri) throw new Error("MONGODB_URI is not set");
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
}
