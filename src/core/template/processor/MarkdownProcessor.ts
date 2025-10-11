import fs from "fs-extra";
import type { FileProcessor, ProcessContext } from "./types.js";

/**
 * Processor for Markdown files (.md)
 * Direct copy, can be extended for variable replacement if needed
 */
export class MarkdownProcessor implements FileProcessor {
  canProcess(fileName: string): boolean {
    return fileName.endsWith(".md");
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
