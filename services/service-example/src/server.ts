/**
 * Express server setup
 */

import express, { type Express } from "express";
import { router } from "./routes/index.js";

export const server: Express = express();

// Middleware
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Routes
server.use("/api", router);

// Health check endpoint
server.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
