import path from "node:path";
import fs from "fs-extra";
import { fileURLToPath } from "node:url";
import type { FileProcessor, ProcessContext } from "./processor/types.js";
import {
  PackageJsonProcessor,
  TsConfigProcessor,
  TypeScriptProcessor,
  MarkdownProcessor,
} from "./processor/index.js";

/**
 * File mapping for template processing
 */
export interface FileMapping {
  /**
   * Source file path relative to NodeSpec root
   */
  source: string;

  /**
   * Target file path relative to generation target directory
   */
  target: string;
}

/**
 * Base generator class with file processor chain
 */
export abstract class BaseGenerator {
  protected processors: FileProcessor[] = [];

  constructor() {
    // Register all file processors (order doesn't matter - atomic matching)
    this.processors = [
      new PackageJsonProcessor(),
      new TsConfigProcessor(),
      new TypeScriptProcessor(),
      new MarkdownProcessor(),
    ];
  }

  /**
   * Get the root directory of NodeSpec project
   * This is the source of truth for all templates
   */
  protected getNodeSpecRoot(): string {
    // When running from source: find NodeSpec repo root
    // When running from published CLI: use embedded template directory
    // TODO: Implement runtime detection for published package

    // For now, assume running from source
    // Go up from src/core/template/BaseGenerator.ts to repo root
    const currentFile = fileURLToPath(import.meta.url);
    const coreDir = path.dirname(path.dirname(currentFile)); // src/core
    const srcDir = path.dirname(coreDir); // src
    const repoRoot = path.dirname(srcDir); // repo root

    return repoRoot;
  }

  /**
   * Process a single file through the processor chain
   */
  protected async processFile(
    fileName: string,
    sourcePath: string,
    targetPath: string,
    context: ProcessContext,
  ): Promise<void> {
    const processor = this.processors.find((p) => p.canProcess(fileName));

    if (!processor) {
      throw new Error(`No processor found for file: ${fileName}`);
    }

    await processor.process(sourcePath, targetPath, context);
  }

  /**
   * Process multiple files with file mappings
   */
  protected async processFiles(
    files: FileMapping[],
    targetDir: string,
    context: ProcessContext,
  ): Promise<void> {
    const templateRoot = this.getNodeSpecRoot();

    for (const file of files) {
      const sourcePath = path.join(templateRoot, file.source);
      const targetPath = path.join(targetDir, file.target);

      // Ensure target directory exists
      await fs.ensureDir(path.dirname(targetPath));

      // Process the file
      await this.processFile(file.target, sourcePath, targetPath, context);
    }
  }

  /**
   * Extract directory name from package name
   * @param name - Package name (may include scope like @org/name)
   * @returns Directory name without scope
   * @example
   * extractDirectoryName('@myorg/utils') // 'utils'
   * extractDirectoryName('my-lib') // 'my-lib'
   */
  protected extractDirectoryName(name: string): string {
    if (name.startsWith("@")) {
      const parts = name.split("/");
      return parts.length > 1 ? parts[1]! : parts[0]!.slice(1);
    }
    return name;
  }
}
