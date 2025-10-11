#!/usr/bin/env node
/**
 * Build script to generate JSON configuration files from TypeScript configs
 */
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { typescript } from "../src/api/typescript.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "..", "dist");

// Ensure dist directory exists
mkdirSync(distDir, { recursive: true });

// Generate TypeScript base config JSON
const tsConfigPath = join(distDir, "typescript-base.json");
writeFileSync(tsConfigPath, JSON.stringify(typescript.base, null, 2));

console.log("✅ Generated TypeScript config:", tsConfigPath);
