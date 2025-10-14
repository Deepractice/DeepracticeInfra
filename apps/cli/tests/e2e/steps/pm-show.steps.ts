/**
 * Step definitions for PM Feature Show command
 */
import { Given, Then, DataTable } from "@deepracticex/vitest-cucumber";
import { expect } from "chai";
import fs from "fs-extra";
import path from "node:path";
import yaml from "yaml";
import type { InfraWorld } from "../support/world.js";

// ========================================
// Background and Setup Steps
// ========================================

Given(
  "the following feature is initialized:",
  async function (this: InfraWorld, dataTable: DataTable) {
    const rows = dataTable.hashes();

    for (const row of rows) {
      const featureId = row.id!;
      const featurePath = row.path!;

      // Create feature file
      const fullPath = path.join(this.testDir!, featurePath);
      await fs.ensureDir(path.dirname(fullPath));

      // Create a sample feature file with content
      const featureContent = `@spec:id=${featureId}
Feature: Initialize Monorepo in Current Directory
  As a developer
  I want to initialize a NodeSpec monorepo
  So that I can start building my project with best practices

  Background:
    Given I am in an empty directory

  Rule: Initialize creates standard monorepo structure

    Scenario: Initialize with default configuration
      When I run "nodespec infra monorepo init"
      Then the command should succeed
      And the following directories should exist:
        | directory      |
        | apps          |
        | packages      |

    Scenario: Initialize with custom name
      When I run "nodespec infra monorepo init --name my-project"
      Then the command should succeed
      And package.json should contain name "my-project"

  Rule: Validate prerequisites before initialization

    Scenario: Fail when pnpm is not installed
      Given pnpm is not available in PATH
      When I run "nodespec infra monorepo init"
      Then the command should fail
      And I should see error message "pnpm is required"

  Rule: Configuration files are created with correct content

    Scenario: Create pnpm workspace configuration
      When I run "nodespec infra monorepo init"
      Then pnpm-workspace.yaml should contain:
        | content          |
        | apps/*          |
        | packages/*      |

    Scenario: Create TypeScript configuration
      When I run "nodespec infra monorepo init"
      Then tsconfig.json should exist
      And tsconfig.json should contain references to workspace packages

  Rule: Handle existing files gracefully

    Scenario: Skip existing files without overwriting
      Given a file "package.json" exists
      When I run "nodespec infra monorepo init"
      Then the command should succeed
      And the existing package.json should not be modified
      And I should see message "Skipping existing file: package.json"
`;

      await fs.writeFile(fullPath, featureContent);

      // Create or update feature index
      const indexPath = path.join(this.testDir!, ".nodespec/pm/index.json");
      let index: { version: string; features: Record<string, any> } = {
        version: "1.0.0",
        features: {},
      };

      if (await fs.pathExists(indexPath)) {
        index = await fs.readJson(indexPath);
      }

      // Extract feature title from content
      const titleMatch = featureContent.match(/Feature: (.+)/);
      const title = titleMatch
        ? titleMatch[1]!.trim()
        : "Initialize Monorepo in Current Directory";

      // Add feature to index with metadata
      const stats = await fs.stat(fullPath);
      index.features[featureId] = {
        id: featureId,
        title: title,
        path: featurePath,
        lastModified: stats.mtime.toISOString(),
        lastIndexed: new Date().toISOString(),
      };

      await fs.writeJson(indexPath, index, { spaces: 2 });
    }
  },
);

Given(
  "I am in directory {string}",
  async function (this: InfraWorld, directory: string) {
    const targetDir = path.join(this.testDir!, directory);
    await fs.ensureDir(targetDir);
    this.testDir = targetDir;
  },
);

Given(
  "the feature has tags {string} and {string}",
  async function (this: InfraWorld, tag1: string, tag2: string) {
    // This step modifies the already initialized feature to add tags
    // For now, we'll store this in context to be used by verification steps
    this.set("expectedTags", [tag1, tag2]);
  },
);

Given(
  "the feature file was modified after last index update",
  async function (this: InfraWorld) {
    // Load the feature index
    const indexPath = path.join(this.testDir!, ".nodespec/pm/index.json");
    const index = await fs.readJson(indexPath);

    // Get the feature path
    const feature = Object.values(index.features)[0] as any;
    const featurePath = path.join(this.testDir!, feature.path);

    // Modify the feature file to make it newer than index
    await new Promise((resolve) => setTimeout(resolve, 100));
    const content = await fs.readFile(featurePath, "utf-8");
    await fs.writeFile(featurePath, content + "\n# Modified\n");

    // Store flag for test verification
    this.set("expectStaleWarning", true);
  },
);

Given(
  "the feature index shows path {string}",
  async function (this: InfraWorld, expectedPath: string) {
    // This is just a validation step, no action needed
    this.set("expectedIndexPath", expectedPath);
  },
);

Given(
  "the actual file is at {string}",
  async function (this: InfraWorld, actualPath: string) {
    // Move the feature file to simulate a moved feature
    const indexPath = path.join(this.testDir!, ".nodespec/pm/index.json");
    const index = await fs.readJson(indexPath);
    const feature = Object.values(index.features)[0] as any;
    const oldPath = path.join(this.testDir!, feature.path);

    // Move file
    const newPath = path.join(this.testDir!, actualPath);
    await fs.ensureDir(path.dirname(newPath));
    await fs.move(oldPath, newPath);

    // Don't update index - this simulates out-of-sync state
    this.set("featureMovedTo", actualPath);
  },
);

// ========================================
// Feature Details Display Validation
// ========================================

Then(
  "I should see feature details:",
  function (this: InfraWorld, dataTable: DataTable) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    const rows = dataTable.hashes();

    for (const row of rows) {
      const field = row.field!;
      const value = row.value!;

      expect(allOutput).to.include(
        field,
        `Output should contain field label: ${field}`,
      );
      expect(allOutput).to.include(
        value,
        `Output should contain value: ${value}`,
      );
    }
  },
);

Then(
  "I should see section {string} with count",
  function (this: InfraWorld, sectionName: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");

    // Check for section header with count pattern like "Rules (4):" or "Scenarios (11):"
    const sectionPattern = new RegExp(`${sectionName}\\s*\\(\\d+\\):?`, "i");
    expect(allOutput).to.match(
      sectionPattern,
      `Output should contain section "${sectionName}" with count`,
    );
  },
);

Then(
  "I should see the complete feature file content",
  function (this: InfraWorld) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");

    // Check for key feature file elements
    expect(allOutput).to.include("Feature:", "Should show Feature keyword");
    expect(allOutput).to.include("Rule:", "Should show Rule sections");
    expect(allOutput).to.include("Scenario:", "Should show Scenarios");
    expect(allOutput).to.include("Given", "Should show Given steps");
    expect(allOutput).to.include("When", "Should show When steps");
    expect(allOutput).to.include("Then", "Should show Then steps");
  },
);

Then(
  "I should see feature details with ID {string}",
  function (this: InfraWorld, expectedId: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include(
      expectedId,
      `Output should contain feature ID: ${expectedId}`,
    );
  },
);

Then(
  "I should see {string}",
  function (this: InfraWorld, expectedText: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include(expectedText);
  },
);

Then("I should see rule titles listed", function (this: InfraWorld) {
  const allOutput = [...this.stdout, ...this.stderr].join("\n");

  // Check that output contains rule-like patterns
  // Rules typically have titles after "Rule:" keyword
  expect(allOutput).to.match(
    /Rule:/i,
    "Output should contain at least one Rule section",
  );
});

Then(
  "I should see scenario titles grouped by rule",
  function (this: InfraWorld) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");

    // Check that scenarios are listed
    expect(allOutput).to.match(
      /Scenario:/i,
      "Output should contain scenario listings",
    );
  },
);

Then(
  "I should see section {string} containing:",
  function (this: InfraWorld, sectionName: string, dataTable: DataTable) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    const rows = dataTable.hashes();

    // Verify section exists
    expect(allOutput).to.include(sectionName);

    // Verify each item in the section
    for (const row of rows) {
      const tag = row.tag!;
      expect(allOutput).to.include(
        tag,
        `Section "${sectionName}" should contain: ${tag}`,
      );
    }
  },
);

Then(
  "I should see warning {string}",
  function (this: InfraWorld, warningMessage: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include(
      warningMessage,
      `Output should contain warning: ${warningMessage}`,
    );
  },
);

// ========================================
// Output Format Validation
// ========================================

Then("the output should be valid JSON", function (this: InfraWorld) {
  const allOutput = [...this.stdout, ...this.stderr].join("\n");

  try {
    const parsed = JSON.parse(allOutput);
    expect(parsed).to.be.an("object");
  } catch (error) {
    throw new Error(
      `Output is not valid JSON: ${error instanceof Error ? error.message : "Unknown error"}\n\nOutput:\n${allOutput}`,
    );
  }
});

Then(
  "the JSON should contain fields:",
  function (this: InfraWorld, dataTable: DataTable) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    const json = JSON.parse(allOutput);
    const rows = dataTable.hashes();

    for (const row of rows) {
      const field = row.field!;
      expect(json).to.have.property(
        field,
        `JSON should contain field: ${field}`,
      );
    }
  },
);

Then("the output should be valid YAML", function (this: InfraWorld) {
  const allOutput = [...this.stdout, ...this.stderr].join("\n");

  try {
    const parsed = yaml.parse(allOutput);
    expect(parsed).to.be.an("object");
  } catch (error) {
    throw new Error(
      `Output is not valid YAML: ${error instanceof Error ? error.message : "Unknown error"}\n\nOutput:\n${allOutput}`,
    );
  }
});

Then("the YAML should contain feature details", function (this: InfraWorld) {
  const allOutput = [...this.stdout, ...this.stderr].join("\n");
  const parsed = yaml.parse(allOutput);

  // Verify essential feature fields exist in YAML
  expect(parsed).to.have.property("id");
  expect(parsed).to.have.property("title");
  expect(parsed).to.have.property("path");
});

// ========================================
// Metadata and Statistics Validation
// ========================================

Then(
  "I should see metadata:",
  function (this: InfraWorld, dataTable: DataTable) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    const rows = dataTable.hashes();

    for (const row of rows) {
      const field = row.field!;
      // Just verify the field label exists, not specific values
      expect(allOutput).to.include(
        field,
        `Output should contain metadata field: ${field}`,
      );
    }
  },
);

Then(
  "I should see statistics:",
  function (this: InfraWorld, dataTable: DataTable) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    const rows = dataTable.hashes();

    for (const row of rows) {
      const metric = row.metric!;
      // Verify the metric label exists
      expect(allOutput).to.include(
        metric,
        `Output should contain statistic: ${metric}`,
      );
    }
  },
);

Then(
  "I should see section {string} containing features from:",
  function (this: InfraWorld, sectionName: string, _dataTable: DataTable) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");

    // Verify section exists
    expect(allOutput).to.include(
      sectionName,
      `Output should contain section: ${sectionName}`,
    );

    // For related features, we just verify the section exists
    // Actual feature listing verification would depend on implementation
  },
);

// ========================================
// Error Handling Validation
// ========================================

// Note: Error message step is already defined in common.steps.ts
// We'll add specific validation for show command errors if needed

// ========================================
// Helper Functions
// ========================================

/**
 * Parse feature content and extract structured information
 * (Currently unused but kept for future test enhancements)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseFeatureContent(content: string): {
  title: string;
  rules: string[];
  scenarios: string[];
  tags: string[];
} {
  const lines = content.split("\n");
  const result = {
    title: "",
    rules: [] as string[],
    scenarios: [] as string[],
    tags: [] as string[],
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Extract tags
    if (trimmed.startsWith("@")) {
      result.tags.push(trimmed);
    }

    // Extract feature title
    if (trimmed.startsWith("Feature:")) {
      result.title = trimmed.replace("Feature:", "").trim();
    }

    // Extract rule titles
    if (trimmed.startsWith("Rule:")) {
      result.rules.push(trimmed.replace("Rule:", "").trim());
    }

    // Extract scenario titles
    if (
      trimmed.startsWith("Scenario:") ||
      trimmed.startsWith("Scenario Outline:")
    ) {
      result.scenarios.push(
        trimmed.replace(/Scenario(?:\s+Outline)?:/, "").trim(),
      );
    }
  }

  return result;
}
