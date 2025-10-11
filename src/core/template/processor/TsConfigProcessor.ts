import fs from "fs-extra";
import type { FileProcessor, ProcessContext } from "./types.js";

/**
 * Processor for tsconfig.json files
 * Handles JSON with Comments (JSONC) format
 * Typically no modification needed, just copy as-is
 */
export class TsConfigProcessor implements FileProcessor {
  canProcess(fileName: string): boolean {
    return fileName.endsWith("tsconfig.json");
  }

  async process(
    sourcePath: string,
    targetPath: string,
    _context: ProcessContext,
  ): Promise<void> {
    // tsconfig.json supports comments (JSONC format)
    // Direct copy preserves comments
    const content = await fs.readFile(sourcePath, "utf-8");
    await fs.writeFile(targetPath, content);
  }
}
