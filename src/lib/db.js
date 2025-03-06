import mongoose from "mongoose";
import { MongoClient } from "mongodb";

const { MONGODB_URI, MONGODB_DB } = process.env;

if (!MONGODB_URI || !MONGODB_DB) {
  console.error(
    "MONGODB_URI and MONGODB_DB must be defined in environment variables."
  );
  process.exit(1);
}

// MongoDB Native Driver client
let mongoClient = null;
// Mongoose connection
let mongooseConnection = { isConnected: false };

/**
 * Get or create MongoDB Native Driver client
 */
export async function getMongoClient() {
  if (mongoClient) {
    return mongoClient;
  }
  
  try {
    mongoClient = new MongoClient(MONGODB_URI, {
      maxPoolSize: 500,
    });
    
    await mongoClient.connect();
    console.log("MongoDB Native client connected");
    
    // Setup graceful shutdown
    process.on("SIGINT", async () => {
      if (mongoClient) {
        await mongoClient.close();
        console.log("MongoDB Native client closed due to app termination");
      }
      if (mongooseConnection.isConnected) {
        await mongoose.disconnect();
        console.log("Mongoose connection disconnected due to app termination");
      }
      process.exit(0);
    });
    
    return mongoClient;
  } catch (error) {
    console.error("Error connecting to MongoDB with native client", error);
    process.exit(1);
  }
}

/**
 * Connect to MongoDB using Mongoose (if needed alongside the Native client)
 */
export async function dbConnect() {
  if (mongooseConnection.isConnected) {
    console.log("Using existing Mongoose connection");
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB,
      bufferCommands: false,
      maxPoolSize: 500,
    });

    mongooseConnection.isConnected = db.connections[0].readyState;
    console.log("New Mongoose connection created");
  } catch (error) {
    console.error("Error connecting to database with Mongoose", error);
    process.exit(1);
  }
}
