import fs from "fs-extra";
import type { FileProcessor, ProcessContext } from "./types.js";

/**
 * Generic processor for plain text files that don't need special handling.
 * This is a catch-all processor that handles:
 * - Environment files (.env, .env.example)
 * - Generic JSON files (not package.json or tsconfig.json)
 * - YAML files (.yml, .yaml)
 * - JavaScript config files (.js, .mjs, .cjs)
 * - Dotfiles (.gitignore, .npmrc, .editorconfig)
 *
 * This processor should be registered LAST in the processor chain
 * so that specialized processors (PackageJsonProcessor, TsConfigProcessor)
 * can match first.
 */
export class GenericFileProcessor implements FileProcessor {
  canProcess(fileName: string): boolean {
    const textExtensions = [
      ".env",
      ".json",
      ".yml",
      ".yaml",
      ".js",
      ".mjs",
      ".cjs",
      ".gitignore",
      ".npmrc",
      ".editorconfig",
      ".prettierrc",
      ".eslintrc",
    ];

    // Match files ending with any of the extensions
    // or match dotfiles without extension (like .gitignore)
    return textExtensions.some(
      (ext) =>
        fileName.endsWith(ext) ||
        (ext.startsWith(".") && fileName === ext.slice(1)),
    );
  }

  async process(
    sourcePath: string,
    targetPath: string,
    _context: ProcessContext,
  ): Promise<void> {
    const content = await fs.readFile(sourcePath, "utf-8");
    await fs.writeFile(targetPath, content);
  }
}
