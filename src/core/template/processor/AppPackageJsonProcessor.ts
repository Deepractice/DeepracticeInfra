import fs from "fs-extra";
import type { FileProcessor, ProcessContext } from "./types.js";

/**
 * Extended context for app generation
 */
export interface AppProcessContext extends ProcessContext {
  /**
   * Binary name for CLI command
   */
  binName: string;
}

/**
 * Processor for app package.json files
 * Handles bin field configuration for CLI apps
 */
export class AppPackageJsonProcessor implements FileProcessor {
  canProcess(fileName: string): boolean {
    return fileName.endsWith("package.json");
  }

  async process(
    sourcePath: string,
    targetPath: string,
    context: ProcessContext,
  ): Promise<void> {
    const template = await fs.readJson(sourcePath);
    const appContext = context as AppProcessContext;

    // Merge strategy: preserve template, override necessary fields
    const result = {
      ...template,
      name: appContext.packageName,
      version: "0.0.1",
      description: `${appContext.packageName} application`,
      bin: {
        [appContext.binName]: "./dist/cli.js",
      },
    };

    await fs.writeJson(targetPath, result, { spaces: 2 });
  }
}
