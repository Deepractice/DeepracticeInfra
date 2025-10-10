#!/usr/bin/env tsx

/**
 * Copy mirror from nodespec-mirror package to CLI dist
 */

import path from "node:path";
import fs from "fs-extra";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function copyMirror() {
  console.log("🪞 Copying NodeSpec mirror to CLI dist...");

  const mirrorSource = path.resolve(
    __dirname,
    "../../../src/mirror/dist/mirror",
  );
  const mirrorDest = path.resolve(__dirname, "../dist/mirror");

  // Check if mirror source exists
  if (!(await fs.pathExists(mirrorSource))) {
    console.error(
      "❌ Mirror source not found. Please run 'pnpm --filter @deepracticex/nodespec-mirror build' first.",
    );
    process.exit(1);
  }

  // Copy mirror
  await fs.copy(mirrorSource, mirrorDest);

  console.log(`✅ Mirror copied to dist/mirror/`);
}

// Run
copyMirror().catch((error) => {
  console.error("❌ Failed to copy mirror:", error);
  process.exit(1);
});
