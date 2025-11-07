import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import http from "http";
import path from "path";

import authRoutes from "./routes/auth";
import boardsRoutes from "./routes/boards";
import cardsRoutes from "./routes/cards";
import notesRoutes from "./routes/notes";
import activityRoutes from "./routes/activity";
import teamsRoutes from "./routes/teams";
import inviteRoutes from "./routes/invite";
import userRoutes from "./routes/user";
import { handleDemo } from "./routes/demo";
import { errorHandler } from "./middleware/errorHandler";
import { initSocket } from "./socket";

export async function createServer(opts: { connectDB?: boolean } = {}) {
  const { connectDB = true } = opts;
  const app = express();

  // Middleware
  app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  
  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // MongoDB (optional)
  if (connectDB) {
    try {
      const mongoUri =
        process.env.MONGO_URI || "mongodb://localhost:27017/flowspace";
      await mongoose.connect(mongoUri);
      console.log("Connected to MongoDB");
    } catch (err) {
      console.error("Failed to connect to MongoDB:", err);
      // Rethrow so that when running in production the error surfaces; during dev plugin we may pass connectDB:false
      throw err;
    }
  } else {
    console.warn("Skipping MongoDB connection (connectDB=false)");
  }

  // API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  app.use("/api/auth", authRoutes);
  app.use("/api/boards", boardsRoutes);
  app.use("/api/cards", cardsRoutes);
  app.use("/api", notesRoutes);
  app.use("/api/activity", activityRoutes);
  app.use("/api/teams", teamsRoutes);
  app.use("/api/invite", inviteRoutes);
  app.use("/api/user", userRoutes);

  // Error handler
  app.use(errorHandler);

  // Create HTTP server and attach socket.io
  const server = http.createServer(app);
  const io = initSocket(server);
  
  // Attach io to app so controllers can access it
  app.set('io', io);

  return { app, server, io };
}

try {
  // When running in CommonJS, `require` and `module` exist. In ESM (vite bundling) they don't.
  // Guard access to avoid ReferenceError during Vite config bundling.
  // @ts-ignore
  if (typeof require !== "undefined" && require.main === module) {
    (async () => {
      const { server } = await createServer();
      const port = Number(process.env.PORT || 8080);
      server.listen(port, () => console.log(`Server listening on ${port}`));
    })();
  }
} catch (e) {
  // ignore in ESM/bundled contexts
}
