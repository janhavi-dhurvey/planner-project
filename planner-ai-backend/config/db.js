import mongoose from "mongoose";

/* =========================================
   CONNECT DATABASE
========================================= */

const connectDB = async () => {

  try {

    if (!process.env.MONGO_URI) {

      console.error("❌ MONGO_URI not found in .env file");
      process.exit(1);

    }

    /* PREVENT MULTIPLE CONNECTIONS */

    if (mongoose.connection.readyState === 1) {

      console.log("⚠ MongoDB already connected");
      return;

    }

    /* MONGOOSE SETTINGS */

    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(

      process.env.MONGO_URI,

      {

        /* CONNECTION POOL */

        maxPoolSize: 20,
        minPoolSize: 5,

        /* TIMEOUT SETTINGS */

        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 60000,
        connectTimeoutMS: 10000,

        /* STABILITY */

        retryWrites: true,
        autoIndex: process.env.NODE_ENV !== "production"

      }

    );

    console.log("=================================");
    console.log("✅ MongoDB Connected");
    console.log(`🌐 Host: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
    console.log("=================================");

  } catch (error) {

    console.error("❌ MongoDB connection failed");
    console.error(error.message);

    process.exit(1);

  }

};

/* =========================================
   CONNECTION EVENTS
========================================= */

mongoose.connection.on("connected", () => {

  console.log("📡 MongoDB connection established");

});

mongoose.connection.on("reconnected", () => {

  console.log("🔄 MongoDB reconnected");

});

mongoose.connection.on("error", (err) => {

  console.error("⚠ MongoDB connection error:", err);

});

mongoose.connection.on("disconnected", () => {

  console.warn("⚠ MongoDB disconnected");

});

/* =========================================
   GRACEFUL SHUTDOWN
========================================= */

const gracefulShutdown = async () => {

  try {

    await mongoose.connection.close();

    console.log("🛑 MongoDB connection closed");

    process.exit(0);

  } catch (error) {

    console.error("MongoDB shutdown error:", error);

    process.exit(1);

  }

};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

/* =========================================
   EXPORT
========================================= */

export default connectDB;