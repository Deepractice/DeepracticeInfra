import path from "node:path";
import fs from "fs-extra";
import chalk from "chalk";
import { initAction } from "./init.js";

interface CreateOptions {
  skipInstall?: boolean;
  skipGit?: boolean;
}

export async function createAction(
  projectName: string,
  options: CreateOptions,
): Promise<void> {
  try {
    const targetDir = path.resolve(
      process.cwd(),
      extractDirectoryName(projectName),
    );

    // Check if directory already exists
    if (await fs.pathExists(targetDir)) {
      console.error(chalk.red(`Error: Directory already exists: ${targetDir}`));
      process.exit(1);
    }

    // Create target directory
    await fs.ensureDir(targetDir);

    // Change to target directory and run init
    process.chdir(targetDir);
    await initAction({ name: projectName, ...options });
  } catch (error) {
    console.error(
      chalk.red(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      ),
    );
    process.exit(1);
  }
}

/**
 * Extract directory name from project name
 * @param name - Project name (may include scope like @org/name)
 * @returns Directory name without scope
 * @example
 * extractDirectoryName('@myorg/myapp') // 'myapp'
 * extractDirectoryName('myapp') // 'myapp'
 */
function extractDirectoryName(name: string): string {
  if (name.startsWith("@")) {
    const parts = name.split("/");
    return parts.length > 1 ? parts[1] : parts[0].slice(1);
  }
  return name;
}
