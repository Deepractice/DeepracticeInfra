/**
 * World context for CLI E2E tests
 */
import type { Result } from "execa";
import fs from "fs-extra";
import path from "node:path";

export interface InfraWorld {
  // Working directory context
  testDir?: string;
  originalCwd?: string;

  // Command execution state
  lastCommand?: string;
  lastResult?: Result;
  lastError?: Error;
  exitCode?: number;

  // Output capture
  stdout: string[];
  stderr: string[];

  // Test state
  expectedMissingPackages?: string[];

  // Context storage
  context: Map<string, unknown>;

  // Helper methods
  set(key: string, value: unknown): void;
  get(key: string): unknown;
  clear(): void;

  // PM Feature helpers
  getFeatureFiles?(): Promise<string[]>;
  getAllFeatureFiles?(): Promise<string[]>;
  pathToSpecId?(featurePath: string): string;
  generateSpecIdFromPath?(featurePath: string): string;
  findFeatureFiles?(rootDir: string): Promise<string[]>;
}

export function createWorld(): InfraWorld {
  const context = new Map<string, unknown>();

  return {
    stdout: [],
    stderr: [],
    context,

    set(key: string, value: unknown) {
      this.context.set(key, value);
    },

    get(key: string) {
      return this.context.get(key);
    },

    clear() {
      this.context.clear();
      this.testDir = undefined;
      this.originalCwd = undefined;
      this.lastCommand = undefined;
      this.lastResult = undefined;
      this.lastError = undefined;
      this.exitCode = undefined;
      this.stdout = [];
      this.stderr = [];
      this.expectedMissingPackages = undefined;
    },

    // PM Feature helper implementations
    async getFeatureFiles(): Promise<string[]> {
      const featuresDir = path.join(this.testDir!, "apps/cli/features");
      if (!(await fs.pathExists(featuresDir))) {
        return [];
      }

      const files: string[] = [];
      const walk = async (dir: string) => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await walk(fullPath);
          } else if (entry.name.endsWith(".feature")) {
            files.push(fullPath);
          }
        }
      };

      await walk(featuresDir);
      return files;
    },

    async getAllFeatureFiles(): Promise<string[]> {
      return this.getFeatureFiles!();
    },

    pathToSpecId(featurePath: string): string {
      // Convert path to spec ID
      // e.g., "apps/cli/features/infra/monorepo/init.feature" -> "cli-infra-monorepo-init"
      const parts = featurePath.split("/");
      const relevantParts = [];

      let startIndex = parts.indexOf("apps");
      if (startIndex !== -1) {
        relevantParts.push(parts[startIndex + 1]!); // cli
      }

      const featureIndex = parts.indexOf("features");
      if (featureIndex !== -1) {
        for (let i = featureIndex + 1; i < parts.length; i++) {
          const part = parts[i]!.replace(".feature", "");
          relevantParts.push(part);
        }
      }

      return relevantParts.join("-").toLowerCase();
    },

    generateSpecIdFromPath(featurePath: string): string {
      return this.pathToSpecId!(featurePath);
    },

    async findFeatureFiles(rootDir: string): Promise<string[]> {
      const results: string[] = [];

      async function scan(dir: string): Promise<void> {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            // Skip node_modules, dist, .nodespec
            if (!["node_modules", "dist", ".nodespec"].includes(entry.name)) {
              await scan(fullPath);
            }
          } else if (entry.isFile() && entry.name.endsWith(".feature")) {
            results.push(fullPath);
          }
        }
      }

      await scan(rootDir);
      return results;
    },
  };
}
