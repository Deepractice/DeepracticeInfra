/**
 * Context passed to file processors during generation
 */
export interface ProcessContext {
  /**
   * Package or app name (may include scope like @org/name)
   */
  packageName: string;

  /**
   * Directory name (without scope)
   */
  dirName: string;

  /**
   * Additional context properties that can be extended
   */
  [key: string]: unknown;
}

/**
 * File processor interface for handling different file types
 */
export interface FileProcessor {
  /**
   * Determine if this processor can handle the given file
   * @param fileName - The target file name (not full path)
   * @returns true if this processor can handle the file
   */
  canProcess(fileName: string): boolean;

  /**
   * Process a file from source to target with context
   * @param sourcePath - Absolute path to source file
   * @param targetPath - Absolute path to target file
   * @param context - Processing context
   */
  process(
    sourcePath: string,
    targetPath: string,
    context: ProcessContext,
  ): Promise<void>;
}
