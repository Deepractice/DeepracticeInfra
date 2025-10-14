import path from "node:path";
import fs from "fs-extra";
import { globby } from "globby";
import { FeatureParser } from "./FeatureParser.js";
import { FeatureIndexManager } from "./FeatureIndexManager.js";

export interface InitFeatureResult {
  initialized: boolean;
  specId: string;
  message: string;
}

export interface InitAllFeaturesResult {
  initialized: number;
  alreadyInitialized: number;
}

export class FeatureManager {
  private readonly parser: FeatureParser;
  private readonly indexManager: FeatureIndexManager;
  private readonly monorepoRoot: string;

  constructor(monorepoRoot: string) {
    this.monorepoRoot = monorepoRoot;
    this.parser = new FeatureParser();
    this.indexManager = new FeatureIndexManager(monorepoRoot);
  }

  /**
   * Initialize a single feature with @spec:id tag
   */
  async initFeature(featurePath: string): Promise<InitFeatureResult> {
    // Resolve absolute path
    const absolutePath = path.isAbsolute(featurePath)
      ? featurePath
      : path.join(this.monorepoRoot, featurePath);

    if (!(await fs.pathExists(absolutePath))) {
      throw new Error(`Feature file not found: ${featurePath}`);
    }

    // Parse feature
    const featureInfo = await this.parser.parseFeature(absolutePath);
    const relativePath = path.relative(this.monorepoRoot, absolutePath);

    // Check if already has spec:id
    if (featureInfo.specId) {
      // Update index
      const index = await this.indexManager.load();
      await this.indexManager.addOrUpdate(
        index,
        relativePath,
        this.monorepoRoot,
      );
      await this.indexManager.save(index);

      return {
        initialized: false,
        specId: featureInfo.specId,
        message: "Feature already initialized",
      };
    }

    // Generate spec:id
    const specId = this.parser.generateSpecId(relativePath);

    // Update feature file
    await this.parser.updateSpecId(absolutePath, specId);

    // Update index
    const index = await this.indexManager.load();
    await this.indexManager.addOrUpdate(index, relativePath, this.monorepoRoot);
    await this.indexManager.save(index);

    return {
      initialized: true,
      specId,
      message: "Feature initialized successfully",
    };
  }

  /**
   * Initialize all features in monorepo
   */
  async initAllFeatures(): Promise<InitAllFeaturesResult> {
    // Find all .feature files
    const featureFiles = await globby("**/features/**/*.feature", {
      cwd: this.monorepoRoot,
      ignore: ["node_modules/**", "dist/**", ".nodespec/**"],
    });

    let initialized = 0;
    let alreadyInitialized = 0;

    for (const featureFile of featureFiles) {
      const result = await this.initFeature(featureFile);
      if (result.initialized) {
        initialized++;
      } else {
        alreadyInitialized++;
      }
    }

    return {
      initialized,
      alreadyInitialized,
    };
  }

  /**
   * Validate if current directory is a NodeSpec monorepo
   */
  async validateMonorepo(): Promise<boolean> {
    const packageJsonPath = path.join(this.monorepoRoot, "package.json");
    if (!(await fs.pathExists(packageJsonPath))) {
      return false;
    }

    const packageJson = await fs.readJson(packageJsonPath);

    // Check if it's a NodeSpec monorepo (has @deepracticex/nodespec-core dependency)
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    return "@deepracticex/nodespec-core" in allDeps;
  }
}
