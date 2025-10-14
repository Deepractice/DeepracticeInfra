import path from "path";
import fs from "fs-extra";
import { globby } from "globby";
import { FeatureParser } from "./FeatureParser.js";
import { FeatureIndexManager } from "./FeatureIndexManager.js";
import type {
  FeatureValidationResult,
  ValidateOptions,
  FeatureIndex,
} from "./types.js";

export class FeatureValidator {
  private parser: FeatureParser;
  private indexManager: FeatureIndexManager;
  private rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
    this.parser = new FeatureParser();
    this.indexManager = new FeatureIndexManager(rootDir);
  }

  /**
   * Validate a single feature file
   */
  async validateFile(
    featurePath: string,
    options: ValidateOptions = {},
  ): Promise<FeatureValidationResult> {
    const result: FeatureValidationResult = {
      valid: true,
      validCount: 0,
      invalidCount: 0,
      errors: [],
      warnings: [],
      suggestions: [],
    };

    const absolutePath = path.isAbsolute(featurePath)
      ? featurePath
      : path.join(this.rootDir, featurePath);

    // Check file exists
    if (!(await fs.pathExists(absolutePath))) {
      result.valid = false;
      result.invalidCount = 1;
      result.errors.push({
        type: "error",
        category: "missing-spec-id",
        message: `Feature file not found: ${featurePath}`,
        featurePath,
      });
      return result;
    }

    try {
      const info = await this.parser.parseFeature(absolutePath);

      // Check @spec:id presence
      if (!info.specId) {
        result.valid = false;
        result.invalidCount = 1;
        result.errors.push({
          type: "error",
          category: "missing-spec-id",
          message: "Missing @spec:id tag",
          featurePath,
        });
        result.suggestions.push(
          `Run 'nodespec pm feature init ${featurePath}'`,
        );

        // Auto-fix if requested
        if (options.fix) {
          const generatedId = this.parser.generateSpecId(featurePath);
          await this.parser.updateSpecId(absolutePath, generatedId);
          result.valid = true;
          result.validCount = 1;
          result.invalidCount = 0;
          result.errors = [];
          result.suggestions = [`Fixed: added @spec:id=${generatedId}`];
        }

        return result;
      }

      // Validate @spec:id format (kebab-case)
      if (!this.isValidKebabCase(info.specId)) {
        result.valid = false;
        result.invalidCount = 1;
        result.errors.push({
          type: "error",
          category: "invalid-spec-id-format",
          message: "Invalid @spec:id format. Must be kebab-case.",
          featurePath,
          specId: info.specId,
        });
        return result;
      }

      // Check index consistency
      const index = await this.indexManager.load();
      const indexEntry = index.features[info.specId];
      const relativePath = path.relative(this.rootDir, absolutePath);

      if (!indexEntry) {
        result.warnings.push({
          type: "warning",
          category: "missing-from-index",
          message: `Feature not in index: ${info.specId}`,
          featurePath,
          specId: info.specId,
        });
        result.suggestions.push(
          "Run 'nodespec pm feature init --all' to update index",
        );
      } else if (indexEntry.path !== relativePath) {
        result.errors.push({
          type: "error",
          category: "path-mismatch",
          message: `Path mismatch for ${info.specId}`,
          featurePath,
          specId: info.specId,
          details: {
            expected: indexEntry.path,
            found: relativePath,
          },
        });
        result.valid = false;
      }

      if (result.valid && result.errors.length === 0) {
        result.validCount = 1;
      } else {
        result.invalidCount = 1;
        result.valid = false;
      }
    } catch (error) {
      result.valid = false;
      result.invalidCount = 1;
      result.errors.push({
        type: "error",
        category: "missing-spec-id",
        message: `Failed to parse feature: ${error}`,
        featurePath,
      });
    }

    return result;
  }

  /**
   * Validate all features in workspace
   */
  async validateAll(
    options: ValidateOptions = {},
  ): Promise<FeatureValidationResult> {
    const result: FeatureValidationResult = {
      valid: true,
      validCount: 0,
      invalidCount: 0,
      errors: [],
      warnings: [],
      suggestions: [],
    };

    // Load or rebuild index
    let index: FeatureIndex;
    if (options.fast && !options.noCache) {
      index = await this.indexManager.load();
    } else {
      index = await this.indexManager.rebuild(this.rootDir);
    }

    // Find all feature files
    const featureFiles = await globby("**/features/**/*.feature", {
      cwd: this.rootDir,
      ignore: ["**/node_modules/**", "**/dist/**", "**/.git/**"],
    });

    // Track spec IDs for uniqueness check
    const specIdMap = new Map<string, string[]>();

    // Validate each feature file
    for (const relativePath of featureFiles) {
      const absolutePath = path.join(this.rootDir, relativePath);

      try {
        const info = await this.parser.parseFeature(absolutePath);

        // Check @spec:id presence
        if (!info.specId) {
          result.invalidCount++;
          result.errors.push({
            type: "error",
            category: "missing-spec-id",
            message: "Missing @spec:id tag",
            featurePath: relativePath,
          });
          continue;
        }

        // Validate format
        if (!this.isValidKebabCase(info.specId)) {
          result.invalidCount++;
          result.errors.push({
            type: "error",
            category: "invalid-spec-id-format",
            message: "Invalid @spec:id format. Must be kebab-case.",
            featurePath: relativePath,
            specId: info.specId,
          });
          continue;
        }

        // Track for duplicate check
        if (!specIdMap.has(info.specId)) {
          specIdMap.set(info.specId, []);
        }
        specIdMap.get(info.specId)!.push(relativePath);

        // Check index consistency
        const indexEntry = index.features[info.specId];
        if (!indexEntry) {
          result.warnings.push({
            type: "warning",
            category: "missing-from-index",
            message: `Feature not in index: ${info.specId}`,
            featurePath: relativePath,
            specId: info.specId,
          });
        } else if (indexEntry.path !== relativePath) {
          result.errors.push({
            type: "error",
            category: "path-mismatch",
            message: `Path mismatch for ${info.specId}`,
            featurePath: relativePath,
            specId: info.specId,
            details: {
              expected: indexEntry.path,
              found: relativePath,
            },
          });
          result.invalidCount++;
          continue;
        }

        result.validCount++;
      } catch (error) {
        result.invalidCount++;
        result.errors.push({
          type: "error",
          category: "missing-spec-id",
          message: `Failed to parse feature: ${error}`,
          featurePath: relativePath,
        });
      }
    }

    // Check for duplicate spec IDs
    for (const [specId, paths] of specIdMap.entries()) {
      if (paths.length > 1) {
        result.invalidCount += paths.length;
        result.validCount -= paths.length;
        result.errors.push({
          type: "error",
          category: "duplicate-spec-id",
          message: `Duplicate @spec:id found: ${specId}`,
          specId,
          details: {
            duplicatePaths: paths,
          },
        });
      }
    }

    // Check for stale index entries
    for (const [specId, entry] of Object.entries(index.features)) {
      const absolutePath = path.join(this.rootDir, entry.path);
      if (!(await fs.pathExists(absolutePath))) {
        result.warnings.push({
          type: "warning",
          category: "stale-index-entry",
          message: `Stale index entry: ${specId} (file not found)`,
          specId,
          featurePath: entry.path,
        });
      }
    }

    // Generate suggestions
    if (result.errors.some((e) => e.category === "missing-spec-id")) {
      result.suggestions.push(
        "Run 'nodespec pm feature init --all' to add missing tags",
      );
    }
    if (
      result.warnings.some((w) => w.category === "stale-index-entry") ||
      result.warnings.some((w) => w.category === "missing-from-index")
    ) {
      result.suggestions.push(
        "Run 'nodespec pm feature init --all' to rebuild index",
      );
    }

    // Auto-fix if requested
    if (options.fix) {
      let fixedCount = 0;
      for (const error of result.errors) {
        if (error.category === "missing-spec-id" && error.featurePath) {
          try {
            const absolutePath = path.join(this.rootDir, error.featurePath);
            const generatedId = this.parser.generateSpecId(error.featurePath);
            await this.parser.updateSpecId(absolutePath, generatedId);
            fixedCount++;
          } catch (err) {
            console.warn(`Failed to fix ${error.featurePath}: ${err}`);
          }
        }
      }

      if (fixedCount > 0) {
        result.suggestions = [`Fixed ${fixedCount} issues automatically`];
        result.errors = result.errors.filter(
          (e) => e.category !== "missing-spec-id",
        );
        result.invalidCount -= fixedCount;
        result.validCount += fixedCount;
      }
    }

    // Determine overall validity
    result.valid =
      result.errors.length === 0 &&
      (options.strict ? result.warnings.length === 0 : true);

    return result;
  }

  /**
   * Validate kebab-case format
   */
  private isValidKebabCase(str: string): boolean {
    return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(str);
  }
}
