import path from "node:path";
import fs from "fs-extra";
import chalk from "chalk";
import yaml from "js-yaml";
import {
  FeatureIndexManager,
  type FeatureIndexEntry,
} from "@deepracticex/nodespec-core";

interface ShowOptions {
  id?: string;
  path?: string;
  full?: boolean;
  format?: "table" | "json" | "yaml";
  metadata?: boolean;
  stats?: boolean;
  related?: boolean;
}

interface FeatureDetails {
  id: string;
  title: string;
  path: string;
  tags: string[];
  rules?: RuleInfo[];
  scenarios?: ScenarioInfo[];
  metadata?: FileMetadata;
  stats?: FeatureStats;
  relatedFeatures?: FeatureIndexEntry[];
  content?: string;
}

interface RuleInfo {
  title: string;
  scenarios: string[];
}

interface ScenarioInfo {
  title: string;
  rule?: string;
  steps: number;
}

interface FileMetadata {
  fileSize: string;
  lastModified: string;
  lineCount: number;
}

interface FeatureStats {
  totalScenarios: number;
  totalSteps: number;
  scenarioOutlines: number;
}

export async function showAction(options: ShowOptions): Promise<void> {
  try {
    // Validate options
    if (!options.id && !options.path) {
      console.error(chalk.red("Either --id or --path must be provided"));
      process.exit(1);
    }

    if (options.id && options.path) {
      console.error(chalk.red("Cannot use both --id and --path options"));
      process.exit(1);
    }

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
      process.exit(1);
    }

    // Load index
    const index = await manager.load();

    // Find feature
    let feature: FeatureIndexEntry | undefined;

    if (options.id) {
      feature = manager.getEntry(index, options.id);
      if (!feature) {
        console.error(chalk.red(`Feature not found: ${options.id}`));
        process.exit(1);
      }
    } else if (options.path) {
      // Resolve relative path
      const relativePath = path.isAbsolute(options.path)
        ? path.relative(monorepoRoot, options.path)
        : options.path;

      feature = manager.findByPath(index, relativePath);
      if (!feature) {
        console.error(chalk.red("Feature file not found"));
        process.exit(1);
      }
    }

    if (!feature) {
      console.error(chalk.red("Feature not found"));
      process.exit(1);
    }

    // Get feature file path
    const featurePath = path.join(monorepoRoot, feature.path);

    // Check if file exists
    if (!(await fs.pathExists(featurePath))) {
      console.error(chalk.red("Feature file not found at indexed path"));
      console.log(
        chalk.yellow("\nRun 'nodespec pm feature init --all' to rebuild index"),
      );
      process.exit(1);
    }

    // Check for staleness
    const stats = await fs.stat(featurePath);
    const fileModified = new Date(stats.mtime);
    const indexModified = new Date(feature.lastModified);

    const isStale = fileModified > indexModified;

    // Build feature details
    const details: FeatureDetails = {
      id: feature.id,
      title: feature.title,
      path: feature.path,
      tags: feature.tags,
    };

    // Parse feature file for additional details
    const content = await fs.readFile(featurePath, "utf-8");

    if (options.full) {
      details.content = content;
    }

    if (options.format !== "json" && options.format !== "yaml") {
      // Parse structure for display
      const structure = parseFeatureStructure(content);
      details.rules = structure.rules;
      details.scenarios = structure.scenarios;
    }

    if (options.metadata) {
      details.metadata = {
        fileSize: formatFileSize(stats.size),
        lastModified: stats.mtime.toISOString(),
        lineCount: content.split("\n").length,
      };
    }

    if (options.stats) {
      details.stats = calculateStats(content);
    }

    if (options.related) {
      const relatedFeatures = findRelatedFeatures(
        feature,
        manager.getAllEntries(index),
      );
      details.relatedFeatures = relatedFeatures;
    }

    // Output based on format
    const format = options.format || "table";

    if (format === "json") {
      console.log(JSON.stringify(details, null, 2));
    } else if (format === "yaml") {
      console.log(yaml.dump(details));
    } else {
      // Table format (default)
      displayTableFormat(details, isStale);
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
 * Display feature details in table format
 */
function displayTableFormat(details: FeatureDetails, isStale: boolean): void {
  console.log();
  console.log(chalk.bold("Feature Details"));
  console.log(chalk.gray("=".repeat(50)));
  console.log();

  // Basic info
  console.log(`${chalk.bold("ID:")}     ${chalk.cyan(details.id)}`);
  console.log(`${chalk.bold("Title:")}  ${details.title}`);
  console.log(`${chalk.bold("Path:")}   ${chalk.gray(details.path)}`);

  // Tags
  if (details.tags.length > 0) {
    console.log();
    console.log(chalk.bold("Tags:"));
    for (const tag of details.tags) {
      console.log(`  ${chalk.cyan(tag)}`);
    }
  }

  // Rules and scenarios
  if (details.rules && details.rules.length > 0) {
    console.log();
    console.log(chalk.bold(`Rules (${details.rules.length}):`));
    for (const rule of details.rules) {
      console.log(`  - ${rule.title}`);
      if (rule.scenarios.length > 0) {
        console.log(chalk.gray(`    (${rule.scenarios.length} scenarios)`));
      }
    }
  }

  if (details.scenarios && details.scenarios.length > 0) {
    console.log();
    console.log(chalk.bold(`Scenarios (${details.scenarios.length}):`));

    // Group by rule
    const scenariosByRule: Record<string, ScenarioInfo[]> = {};
    const noRuleScenarios: ScenarioInfo[] = [];

    for (const scenario of details.scenarios) {
      if (scenario.rule) {
        if (!scenariosByRule[scenario.rule]) {
          scenariosByRule[scenario.rule] = [];
        }
        scenariosByRule[scenario.rule]!.push(scenario);
      } else {
        noRuleScenarios.push(scenario);
      }
    }

    // Display scenarios without rule first
    for (const scenario of noRuleScenarios) {
      console.log(
        `  - ${scenario.title} ${chalk.gray(`(${scenario.steps} steps)`)}`,
      );
    }

    // Display scenarios grouped by rule
    for (const [ruleName, scenarios] of Object.entries(scenariosByRule)) {
      console.log(chalk.gray(`  [${ruleName}]`));
      for (const scenario of scenarios) {
        console.log(
          `    - ${scenario.title} ${chalk.gray(`(${scenario.steps} steps)`)}`,
        );
      }
    }
  }

  // Metadata
  if (details.metadata) {
    console.log();
    console.log(chalk.bold("Metadata:"));
    console.log(`  File Size:     ${details.metadata.fileSize}`);
    console.log(`  Last Modified: ${details.metadata.lastModified}`);
    console.log(`  Line Count:    ${details.metadata.lineCount}`);
  }

  // Statistics
  if (details.stats) {
    console.log();
    console.log(chalk.bold("Statistics:"));
    console.log(`  Total Scenarios:    ${details.stats.totalScenarios}`);
    console.log(`  Total Steps:        ${details.stats.totalSteps}`);
    console.log(`  Scenario Examples:  ${details.stats.scenarioOutlines}`);
  }

  // Related features
  if (details.relatedFeatures && details.relatedFeatures.length > 0) {
    console.log();
    console.log(chalk.bold("Related Features:"));
    for (const related of details.relatedFeatures) {
      console.log(`  ${chalk.cyan(related.id)} - ${related.title}`);
      console.log(chalk.gray(`    ${related.path}`));
    }
  }

  // Full content
  if (details.content) {
    console.log();
    console.log(chalk.bold("Feature Content:"));
    console.log(chalk.gray("=".repeat(50)));
    console.log(details.content);
  }

  // Location hint
  console.log();
  console.log(chalk.gray(`Open in editor: ${details.path}`));

  // Staleness warning
  if (isStale) {
    console.log();
    console.log(
      chalk.yellow(
        "Warning: Feature file modified since last index update. Run 'nodespec pm feature init --all' to refresh.",
      ),
    );
  }

  console.log();
}

/**
 * Parse feature file structure (rules and scenarios)
 */
function parseFeatureStructure(content: string): {
  rules: RuleInfo[];
  scenarios: ScenarioInfo[];
} {
  const lines = content.split("\n");
  const rules: RuleInfo[] = [];
  const scenarios: ScenarioInfo[] = [];

  let currentRule: RuleInfo | null = null;
  let currentScenario: ScenarioInfo | null = null;
  let stepCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Rule detection
    if (trimmed.startsWith("Rule:")) {
      // Save previous rule if exists
      if (currentRule) {
        rules.push(currentRule);
      }

      currentRule = {
        title: trimmed.replace("Rule:", "").trim(),
        scenarios: [],
      };
      currentScenario = null;
      continue;
    }

    // Scenario detection
    if (
      trimmed.startsWith("Scenario:") ||
      trimmed.startsWith("Scenario Outline:")
    ) {
      // Save previous scenario if exists
      if (currentScenario) {
        currentScenario.steps = stepCount;
        scenarios.push(currentScenario);
        if (currentRule) {
          currentRule.scenarios.push(currentScenario.title);
        }
      }

      const title = trimmed
        .replace("Scenario:", "")
        .replace("Scenario Outline:", "")
        .trim();

      currentScenario = {
        title,
        rule: currentRule?.title,
        steps: 0,
      };
      stepCount = 0;
      continue;
    }

    // Step detection
    if (
      currentScenario &&
      (trimmed.startsWith("Given ") ||
        trimmed.startsWith("When ") ||
        trimmed.startsWith("Then ") ||
        trimmed.startsWith("And ") ||
        trimmed.startsWith("But "))
    ) {
      stepCount++;
    }
  }

  // Save last scenario
  if (currentScenario) {
    currentScenario.steps = stepCount;
    scenarios.push(currentScenario);
    if (currentRule) {
      currentRule.scenarios.push(currentScenario.title);
    }
  }

  // Save last rule
  if (currentRule) {
    rules.push(currentRule);
  }

  return { rules, scenarios };
}

/**
 * Calculate feature statistics
 */
function calculateStats(content: string): FeatureStats {
  const lines = content.split("\n");
  let totalScenarios = 0;
  let totalSteps = 0;
  let scenarioOutlines = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("Scenario:")) {
      totalScenarios++;
    }

    if (trimmed.startsWith("Scenario Outline:")) {
      totalScenarios++;
      scenarioOutlines++;
    }

    if (
      trimmed.startsWith("Given ") ||
      trimmed.startsWith("When ") ||
      trimmed.startsWith("Then ") ||
      trimmed.startsWith("And ") ||
      trimmed.startsWith("But ")
    ) {
      totalSteps++;
    }
  }

  return {
    totalScenarios,
    totalSteps,
    scenarioOutlines,
  };
}

/**
 * Find related features by path proximity
 */
function findRelatedFeatures(
  feature: FeatureIndexEntry,
  allFeatures: FeatureIndexEntry[],
): FeatureIndexEntry[] {
  const featureDir = path.dirname(feature.path);

  return allFeatures
    .filter((f) => {
      // Exclude self
      if (f.id === feature.id) {
        return false;
      }

      // Same directory or parent directory
      const fDir = path.dirname(f.path);
      return fDir === featureDir || fDir.startsWith(featureDir);
    })
    .slice(0, 5); // Limit to 5 related features
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} bytes`;
  }
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(2)} KB`;
  }
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
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
