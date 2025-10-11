#!/usr/bin/env tsx

/**
 * Sync NodeSpec project to mirror directory
 * Creates a complete snapshot of NodeSpec (respecting .gitignore) for template generation
 */

import path from "node:path";
import fs from "fs-extra";
import { globby } from "globby";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function syncMirror() {
  console.log("🪞 Syncing NodeSpec mirror...");

  // Update package.json version to today's date
  await updateVersionToDate();

  // Paths
  const repoRoot = path.resolve(__dirname, "../../..");
  const mirrorDir = path.resolve(__dirname, "../dist/mirror");

  // Clean mirror directory
  await fs.remove(mirrorDir);
  await fs.ensureDir(mirrorDir);

  // Read .gitignore patterns
  const gitignorePath = path.join(repoRoot, ".gitignore");
  const gitignoreContent = await fs.readFile(gitignorePath, "utf-8");
  const ignorePatterns = gitignoreContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((pattern) => {
      // Convert gitignore patterns to globby patterns
      if (pattern.endsWith("/")) {
        return `${pattern}**`;
      }
      return pattern;
    });

  // Additional patterns to exclude
  const additionalIgnore = [
    "**/.git/**",
    "**/node_modules/**",
    "**/dist/**",
    "**/.turbo/**",
  ];

  // Get all files except ignored ones
  const files = await globby("**/*", {
    cwd: repoRoot,
    dot: true,
    gitignore: true, // Respect .gitignore
    ignore: [...ignorePatterns, ...additionalIgnore],
  });

  console.log(`📄 Found ${files.length} files to mirror`);

  // Copy files
  let copied = 0;
  for (const file of files) {
    const sourcePath = path.join(repoRoot, file);
    const targetPath = path.join(mirrorDir, file);

    await fs.ensureDir(path.dirname(targetPath));
    await fs.copy(sourcePath, targetPath);
    copied++;

    if (copied % 100 === 0) {
      console.log(`  Mirrored ${copied}/${files.length} files...`);
    }
  }

  console.log(`✅ Successfully mirrored ${copied} files to dist/mirror/`);
  console.log(`📦 Mirror size: ${await getMirrorSize(mirrorDir)}`);
}

async function getMirrorSize(dir: string): Promise<string> {
  const files = await globby("**/*", { cwd: dir });
  let totalSize = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = await fs.stat(filePath);
    if (stats.isFile()) {
      totalSize += stats.size;
    }
  }

  // Convert to human readable
  const units = ["B", "KB", "MB", "GB"];
  let size = totalSize;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

async function updateVersionToDate() {
  const packageJsonPath = path.resolve(__dirname, "../package.json");
  const packageJson = await fs.readJson(packageJsonPath);

  // Generate version from today's date: YYYY.MM.DD
  const today = new Date();
  const version = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

  packageJson.version = version;
  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

  console.log(`📅 Updated mirror version to ${version}`);
}

// Run
syncMirror().catch((error) => {
  console.error("❌ Failed to sync mirror:", error);
  process.exit(1);
});
