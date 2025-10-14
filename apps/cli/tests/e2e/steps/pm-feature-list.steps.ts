/**
 * Step definitions for PM feature list scenarios
 */
import { Given, Then, DataTable } from "@deepracticex/vitest-cucumber";
import { expect } from "chai";
import fs from "fs-extra";
import path from "node:path";
import os from "node:os";
import type { InfraWorld } from "../support/world.js";

// Background setup steps

Given(
  "the following features are initialized:",
  async function (this: InfraWorld, dataTable: DataTable) {
    const features: Record<
      string,
      { id: string; path: string; title: string; tags: string[] }
    > = {};

    const rows = dataTable.hashes();
    for (const row of rows) {
      const { id, path: featurePath, title } = row;

      // Create feature file
      const absolutePath = path.join(this.testDir!, featurePath!);
      await fs.ensureDir(path.dirname(absolutePath));

      await fs.writeFile(
        absolutePath,
        `# @spec:id ${id}
Feature: ${title}
  As a user
  I want to test
  So that I can verify functionality

  Scenario: Test scenario
    Given a precondition
    When an action occurs
    Then a result is verified
`,
      );

      // Build index entry (matching FeatureIndexEntry type)
      features[id!] = {
        id: id!,
        path: featurePath!,
        title: title!,
        tags: [`spec:id:${id}`],
      };
    }

    // Create feature index
    const indexPath = path.join(this.testDir!, ".nodespec", "pm", "index.json");
    await fs.ensureDir(path.dirname(indexPath));
    await fs.writeJson(indexPath, {
      version: "1.0.0",
      features: features,
      lastUpdated: new Date().toISOString(),
    });
  },
);

Given("no features are initialized", async function (this: InfraWorld) {
  // Create empty feature index
  const indexPath = path.join(this.testDir!, ".nodespec", "pm", "index.json");
  await fs.ensureDir(path.dirname(indexPath));
  await fs.writeJson(indexPath, {
    version: "1.0.0",
    features: {},
    lastUpdated: new Date().toISOString(),
  });
});

Given("no feature index exists", async function (this: InfraWorld) {
  // Ensure index does not exist
  const indexPath = path.join(this.testDir!, ".nodespec", "pm", "index.json");
  if (await fs.pathExists(indexPath)) {
    await fs.remove(indexPath);
  }
});

Given(
  "I am not in a NodeSpec monorepo directory",
  async function (this: InfraWorld) {
    if (!this.testDir) {
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "nodespec-test-"));
      this.testDir = tmpDir.toString();
      this.originalCwd = process.cwd();
    }

    // Ensure pnpm-workspace.yaml does NOT exist
    const workspaceFile = path.join(this.testDir, "pnpm-workspace.yaml");
    if (await fs.pathExists(workspaceFile)) {
      await fs.remove(workspaceFile);
    }
  },
);

Given(
  "the feature index contains an entry for {string}",
  async function (this: InfraWorld, featureId: string) {
    const indexPath = path.join(this.testDir!, ".nodespec", "pm", "index.json");
    const index = await fs.readJson(indexPath);

    // Add stale entry (matching FeatureIndexEntry type)
    index.features[featureId] = {
      id: featureId,
      path: "apps/cli/features/infra/deleted.feature",
      title: "Deleted Feature",
      tags: [`spec:id:${featureId}`],
    };

    await fs.writeJson(indexPath, index);
  },
);

Given(
  "the feature file {string} does not exist",
  async function (this: InfraWorld, featurePath: string) {
    const absolutePath = path.join(this.testDir!, featurePath);
    if (await fs.pathExists(absolutePath)) {
      await fs.remove(absolutePath);
    }
  },
);

// Then steps - output validation

Then(
  "I should see a table with columns:",
  function (this: InfraWorld, dataTable: DataTable) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    const columns = dataTable.hashes();

    for (const { column } of columns) {
      expect(allOutput).to.include(
        column!,
        `Output should contain column header: ${column}`,
      );
    }
  },
);

Then(
  "the output should contain {int} feature(s)",
  function (this: InfraWorld, count: number) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");

    // Count feature entries in table format
    // Look for lines that don't start with spaces (actual data rows)
    const lines = allOutput.split("\n");
    let featureCount = 0;

    for (const line of lines) {
      // Skip empty lines, headers, and separator lines
      if (
        line.trim() &&
        !line.includes("ID") &&
        !line.includes("---") &&
        !line.includes("Total:") &&
        !line.startsWith(" ") &&
        line.includes("-") // Feature IDs contain hyphens
      ) {
        featureCount++;
      }
    }

    expect(featureCount).to.equal(
      count,
      `Expected ${count} features but found ${featureCount}`,
    );
  },
);

Then(
  "the output should contain {string}",
  function (this: InfraWorld, text: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include(text, `Output should contain: ${text}`);
  },
);

Then(
  "the output should not contain {string}",
  function (this: InfraWorld, text: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.not.include(
      text,
      `Output should not contain: ${text}`,
    );
  },
);

Then(
  "features should be listed in alphabetical order by ID",
  function (this: InfraWorld) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    const lines = allOutput.split("\n");

    // Extract feature IDs from output
    const featureIds: string[] = [];
    for (const line of lines) {
      // Match lines with feature IDs (format: "cli-infra-..." at start of line)
      const match = line.match(/^([a-z-]+)\s+/);
      if (match && match[1]!.includes("-")) {
        featureIds.push(match[1]!);
      }
    }

    // Check if sorted
    const sortedIds = [...featureIds].sort();
    expect(featureIds).to.deep.equal(
      sortedIds,
      "Feature IDs should be in alphabetical order",
    );
  },
);

Then(
  "all feature IDs should start with {string}",
  function (this: InfraWorld, prefix: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    const lines = allOutput.split("\n");

    // Extract feature IDs
    for (const line of lines) {
      const match = line.match(/^([a-z-]+)\s+/);
      if (match && match[1]!.includes("-")) {
        expect(match[1]).to.match(
          new RegExp(`^${prefix}`),
          `Feature ID ${match[1]} should start with ${prefix}`,
        );
      }
    }
  },
);

Then("the output should be valid JSON", function (this: InfraWorld) {
  const allOutput = [...this.stdout, ...this.stderr].join("\n");

  try {
    const parsed = JSON.parse(allOutput);
    expect(parsed).to.be.an("array");
  } catch (error) {
    throw new Error(
      `Output is not valid JSON: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
});

Then(
  "the JSON should contain array with {int} feature(s)",
  function (this: InfraWorld, count: number) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    const json = JSON.parse(allOutput);

    expect(json).to.be.an("array");
    expect(json).to.have.length(
      count,
      `Expected ${count} features in JSON array`,
    );
  },
);

Then(
  "each feature should have fields:",
  function (this: InfraWorld, dataTable: DataTable) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    const json = JSON.parse(allOutput);
    const fields = dataTable.hashes().map((row) => row.field);

    expect(json).to.be.an("array");
    expect(json.length).to.be.greaterThan(0, "JSON array should not be empty");

    // Check first feature has all required fields
    const firstFeature = json[0];
    for (const field of fields) {
      expect(firstFeature).to.have.property(
        field!,
        `Feature should have field: ${field}`,
      );
    }
  },
);

Then(
  "the output should contain only IDs, one per line",
  function (this: InfraWorld) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    const lines = allOutput
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    // Each line should be a feature ID (kebab-case)
    for (const line of lines) {
      expect(line).to.match(
        /^[a-z-]+$/,
        `Line should be a feature ID: ${line}`,
      );
    }
  },
);

Then(
  "the output should contain {int} line(s)",
  function (this: InfraWorld, count: number) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    const lines = allOutput
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    expect(lines).to.have.length(count, `Expected ${count} lines in output`);
  },
);

Then(
  "I should see summary {string}",
  function (this: InfraWorld, summary: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include(
      summary,
      `Output should contain summary: ${summary}`,
    );
  },
);

Then(
  "I should see warning {string}",
  function (this: InfraWorld, warning: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include(
      warning,
      `Output should contain warning: ${warning}`,
    );
  },
);
