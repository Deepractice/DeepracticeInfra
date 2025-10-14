import path from "node:path";
import fs from "fs-extra";
import chalk from "chalk";
import {
  FeatureIndexManager,
  type FeatureIndexEntry,
} from "@deepracticex/nodespec-core";

interface ListOptions {
  path?: string;
  id?: string;
  format?: "table" | "json" | "compact";
}

export async function listAction(options: ListOptions): Promise<void> {
  try {
    const monorepoRoot = process.cwd();

    // Validate we are in a monorepo
    await validateMonorepo(monorepoRoot);

    const manager = new FeatureIndexManager(monorepoRoot);
    const indexPath = path.join(monorepoRoot, ".nodespec", "pm", "index.json");

    // Check if index exists
    if (!(await fs.pathExists(indexPath))) {
      console.log(
        chalk.yellow(
          "Feature index not found. Run 'nodespec pm feature init --all' to create index.",
        ),
      );
      return;
    }

    // Load index
    const index = await manager.load();
    const allFeatures = manager.getAllEntries(index);

    // Check for empty index
    if (allFeatures.length === 0) {
      console.log(
        chalk.yellow(
          "No features found. Run 'nodespec pm feature init --all' to initialize.",
        ),
      );
      return;
    }

    // Filter features
    let features = [...allFeatures];

    if (options.path) {
      features = filterByPath(features, options.path);
    }

    if (options.id) {
      features = filterById(features, options.id);
    }

    // Sort alphabetically by ID
    features.sort((a, b) => a.id.localeCompare(b.id));

    // Check for stale entries
    const staleCount = await checkStaleEntries(features, monorepoRoot);

    // Output in requested format
    const format = options.format || "table";

    if (format === "json") {
      console.log(JSON.stringify(features, null, 2));
    } else if (format === "compact") {
      for (const feature of features) {
        console.log(feature.id);
      }
    } else {
      // Table format (default)
      printTable(features);
    }

    // Print summary
    const isFiltered = options.path || options.id;
    if (format === "table") {
      console.log();
      if (isFiltered) {
        console.log(
          chalk.gray(`Total: ${features.length} features (filtered)`),
        );
      } else {
        console.log(chalk.gray(`Total: ${features.length} features`));
      }

      // Show stale warning
      if (staleCount > 0) {
        console.log(
          chalk.yellow(
            `\nFound ${staleCount} stale ${staleCount === 1 ? "entry" : "entries"}. Run 'nodespec pm feature init --all' to refresh.`,
          ),
        );
      }
    }
  } catch (error) {
    console.error(
      chalk.red(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      ),
    );
    process.exit(1);
  }
}

/**
 * Filter features by path pattern
 */
function filterByPath(
  features: FeatureIndexEntry[],
  pattern: string,
): FeatureIndexEntry[] {
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".")
    .replace(/\//g, "\\/");
  const regex = new RegExp(regexPattern);

  return features.filter((f) => {
    // Match against full path or as substring
    return f.path.includes(pattern) || regex.test(f.path);
  });
}

/**
 * Filter features by ID pattern
 */
function filterById(
  features: FeatureIndexEntry[],
  pattern: string,
): FeatureIndexEntry[] {
  return features.filter((f) => {
    // Match exact ID or prefix
    return f.id === pattern || f.id.startsWith(pattern);
  });
}

/**
 * Check for stale entries (features that no longer exist)
 */
async function checkStaleEntries(
  features: FeatureIndexEntry[],
  monorepoRoot: string,
): Promise<number> {
  let staleCount = 0;

  for (const feature of features) {
    const featurePath = path.join(monorepoRoot, feature.path);
    if (!(await fs.pathExists(featurePath))) {
      staleCount++;
    }
  }

  return staleCount;
}

/**
 * Print features as table
 */
function printTable(features: FeatureIndexEntry[]): void {
  if (features.length === 0) {
    return;
  }

  // Calculate column widths
  const idWidth = Math.max(2, ...features.map((f) => f.id.length), "ID".length);
  const titleWidth = Math.max(
    5,
    ...features.map((f) => f.title.length),
    "Title".length,
  );

  // Print header
  console.log();
  console.log(
    chalk.bold(`${"ID".padEnd(idWidth)}  ${"Title".padEnd(titleWidth)}  Path`),
  );
  console.log(
    chalk.gray(
      `${"-".repeat(idWidth)}  ${"-".repeat(titleWidth)}  ${"-".repeat(20)}`,
    ),
  );

  // Print rows
  for (const feature of features) {
    console.log(
      `${chalk.cyan(feature.id.padEnd(idWidth))}  ${feature.title.padEnd(titleWidth)}  ${chalk.gray(feature.path)}`,
    );
  }
}

/**
 * Validate we are in a monorepo by checking for pnpm-workspace.yaml
 */
async function validateMonorepo(cwd: string): Promise<void> {
  const workspaceFile = path.join(cwd, "pnpm-workspace.yaml");
  if (!(await fs.pathExists(workspaceFile))) {
    throw new Error("Not a NodeSpec monorepo");
  }
}
