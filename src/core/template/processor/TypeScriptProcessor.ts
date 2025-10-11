import fs from "fs-extra";
import type { FileProcessor, ProcessContext } from "./types.js";

/**
 * Processor for TypeScript files (.ts)
 * Direct copy, can be extended for variable replacement if needed
 */
export class TypeScriptProcessor implements FileProcessor {
  canProcess(fileName: string): boolean {
    return fileName.endsWith(".ts");
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
