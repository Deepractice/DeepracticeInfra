/**
 * API routes
 */

import express, { type Router } from "express";

export const router: Router = express.Router();

// Example route
router.get("/", (req, res) => {
  res.json({ message: "API is working" });
});
