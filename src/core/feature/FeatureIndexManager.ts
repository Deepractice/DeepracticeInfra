import fs from "fs-extra";
import path from "path";
import { globby } from "globby";
import { FeatureParser } from "./FeatureParser.js";
import type { FeatureIndex, FeatureIndexEntry } from "./types.js";

export class FeatureIndexManager {
  private indexPath: string;
  private parser: FeatureParser;

  constructor(rootDir: string) {
    this.indexPath = path.join(rootDir, ".nodespec", "pm", "index.json");
    this.parser = new FeatureParser();
  }

  /**
   * Load feature index from disk
   */
  async load(): Promise<FeatureIndex> {
    if (!(await fs.pathExists(this.indexPath))) {
      return this.createEmptyIndex();
    }

    try {
      const content = await fs.readFile(this.indexPath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      console.warn(`Failed to load feature index, creating new one: ${error}`);
      return this.createEmptyIndex();
    }
  }

  /**
   * Save feature index to disk
   */
  async save(index: FeatureIndex): Promise<void> {
    await fs.ensureDir(path.dirname(this.indexPath));
    await fs.writeFile(this.indexPath, JSON.stringify(index, null, 2), "utf-8");
  }

  /**
   * Scan workspace and rebuild index
   */
  async rebuild(rootDir: string): Promise<FeatureIndex> {
    const featureFiles = await globby("**/features/**/*.feature", {
      cwd: rootDir,
      ignore: ["**/node_modules/**", "**/dist/**", "**/.git/**"],
    });

    const index = this.createEmptyIndex();

    for (const relativePath of featureFiles) {
      const absolutePath = path.join(rootDir, relativePath);
      try {
        const info = await this.parser.parseFeature(absolutePath);
        if (info.specId) {
          const stats = await fs.stat(absolutePath);
          index.features[info.specId] = {
            id: info.specId,
            path: relativePath,
            title: info.title,
            tags: info.tags,
            lastModified: stats.mtime.toISOString(),
          };
        }
      } catch (error) {
        console.warn(`Failed to parse feature ${relativePath}: ${error}`);
      }
    }

    index.lastUpdated = new Date().toISOString();
    await this.save(index);
    return index;
  }

  /**
   * Add or update feature in index
   */
  async addOrUpdate(
    index: FeatureIndex,
    featurePath: string,
    rootDir: string,
  ): Promise<FeatureIndex> {
    const absolutePath = path.join(rootDir, featurePath);
    const info = await this.parser.parseFeature(absolutePath);

    if (!info.specId) {
      throw new Error(`Feature at ${featurePath} has no @spec:id tag`);
    }

    const stats = await fs.stat(absolutePath);
    index.features[info.specId] = {
      id: info.specId,
      path: featurePath,
      title: info.title,
      tags: info.tags,
      lastModified: stats.mtime.toISOString(),
    };

    index.lastUpdated = new Date().toISOString();
    return index;
  }

  /**
   * Remove feature from index
   */
  async remove(index: FeatureIndex, specId: string): Promise<FeatureIndex> {
    delete index.features[specId];
    index.lastUpdated = new Date().toISOString();
    return index;
  }

  /**
   * Get feature entry by spec ID
   */
  getEntry(index: FeatureIndex, specId: string): FeatureIndexEntry | undefined {
    return index.features[specId];
  }

  /**
   * Find feature by path
   */
  findByPath(
    index: FeatureIndex,
    featurePath: string,
  ): FeatureIndexEntry | undefined {
    return Object.values(index.features).find(
      (entry) => entry.path === featurePath,
    );
  }

  /**
   * Get all feature entries
   */
  getAllEntries(index: FeatureIndex): FeatureIndexEntry[] {
    return Object.values(index.features);
  }

  /**
   * Create empty index structure
   */
  private createEmptyIndex(): FeatureIndex {
    return {
      version: "1.0.0",
      features: {},
      lastUpdated: new Date().toISOString(),
    };
  }
}
