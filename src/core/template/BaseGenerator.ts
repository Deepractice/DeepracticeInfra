import path from "node:path";
import fs from "fs-extra";
import { fileURLToPath } from "node:url";
import type { FileProcessor, ProcessContext } from "./processor/types.js";
import {
  PackageJsonProcessor,
  TsConfigProcessor,
  TypeScriptProcessor,
  MarkdownProcessor,
  GenericFileProcessor,
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
    // Register all file processors
    // NOTE: GenericFileProcessor must be LAST as it's a catch-all
    // Specific processors (PackageJson, TsConfig) must match first
    this.processors = [
      new PackageJsonProcessor(),
      new TsConfigProcessor(),
      new TypeScriptProcessor(),
      new MarkdownProcessor(),
      new GenericFileProcessor(), // Must be last - catches all unmatched files
    ];
  }

  /**
   * Get the root directory of NodeSpec project
   * This is the source of truth for all templates
   *
   * Supports two modes:
   * - Development: Uses NodeSpec repo root directly
   * - Production: Uses mirror directory bundled with CLI
   */
  protected getNodeSpecRoot(): string {
    const currentFile = fileURLToPath(import.meta.url);

    // Production mode: Check for mirror in CLI dist
    // When bundled in CLI: apps/cli/dist/cli.js
    // Mirror is at: apps/cli/dist/mirror/
    const currentDir = path.dirname(currentFile);
    const mirrorInCLI = path.join(currentDir, "mirror");

    if (fs.existsSync(mirrorInCLI)) {
      return mirrorInCLI;
    }

    // Check mirror in parent directory (alternative structure)
    const parentDir = path.dirname(currentDir);
    const mirrorInParent = path.join(parentDir, "mirror");

    if (fs.existsSync(mirrorInParent)) {
      return mirrorInParent;
    }

    // Development mode: Find NodeSpec repo root
    // From src/core/template/BaseGenerator.ts -> repo root
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
