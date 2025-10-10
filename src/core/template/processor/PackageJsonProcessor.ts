import fs from "fs-extra";
import type { FileProcessor, ProcessContext } from "./types.js";

/**
 * Processor for package.json files
 * Merges template with context-specific values
 */
export class PackageJsonProcessor implements FileProcessor {
  canProcess(fileName: string): boolean {
    return fileName.endsWith("package.json");
  }

  async process(
    sourcePath: string,
    targetPath: string,
    context: ProcessContext,
  ): Promise<void> {
    const template = await fs.readJson(sourcePath);

    // Merge strategy: preserve template, only override necessary fields
    const result = {
      ...template,
      name: context.packageName,
      version: "0.0.1",
      description: `${context.packageName} package`,
    };

    await fs.writeJson(targetPath, result, { spaces: 2 });
  }
}
