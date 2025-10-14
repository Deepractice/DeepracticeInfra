/**
 * Step definitions for PM feature validate command
 */
import { Given, Then, DataTable } from "@deepracticex/vitest-cucumber";
import { expect } from "chai";
import fs from "fs-extra";
import path from "node:path";
import type { InfraWorld } from "../support/world.js";

// ============================================================================
// Background and Setup Steps
// ============================================================================

// ============================================================================
// Feature File Creation Steps
// ============================================================================

Given(
  "a feature file exists at {string}",
  async function (this: InfraWorld, featurePath: string) {
    const fullPath = path.join(this.testDir!, featurePath);
    await fs.ensureDir(path.dirname(fullPath));

    const featureContent = `Feature: Test Feature
  As a user
  I want to test
  So that validation works

  Scenario: Test scenario
    Given I have a test
    When I run a test
    Then test should pass
`;

    await fs.writeFile(fullPath, featureContent);
  },
);

Given(
  "the feature has tag {string}",
  async function (this: InfraWorld, tag: string) {
    // Get the last created feature file
    const features = await this.getFeatureFiles();
    if (features.length === 0) {
      throw new Error("No feature file exists to add tag to");
    }

    const featureFile = features[features.length - 1]!;
    let content = await fs.readFile(featureFile, "utf-8");

    // Add tag before Feature line
    content = content.replace(/^Feature:/, `${tag}\nFeature:`);
    await fs.writeFile(featureFile, content);
  },
);

Given("the feature has no @spec:id tag", async function (this: InfraWorld) {
  // Get the last created feature file
  const features = await this.getFeatureFiles();
  if (features.length === 0) {
    throw new Error("No feature file exists");
  }

  const featureFile = features[features.length - 1]!;
  let content = await fs.readFile(featureFile, "utf-8");

  // Remove any @spec:id tag
  content = content.replace(/@spec:id=[\w-]+\n/g, "");
  await fs.writeFile(featureFile, content);
});

Given("the feature is in the index", async function (this: InfraWorld) {
  const features = await this.getFeatureFiles();
  if (features.length === 0) {
    throw new Error("No feature file exists");
  }

  const featureFile = features[features.length - 1]!;
  const content = await fs.readFile(featureFile, "utf-8");

  // Extract spec:id from content
  const match = content.match(/@spec:id=([\w-]+)/);
  if (!match) {
    throw new Error("Feature does not have @spec:id tag");
  }

  const specId = match[1]!;
  const relativePath = path.relative(this.testDir!, featureFile);

  // Add to index
  const indexPath = path.join(this.testDir!, ".nodespec/pm/index.json");
  const index = await fs.readJson(indexPath);

  index.features[specId] = {
    id: specId,
    path: relativePath,
    title: "Test Feature",
    tags: [],
    lastModified: new Date().toISOString(),
  };

  await fs.writeJson(indexPath, index);
});

Given(
  "all feature files have valid @spec:id tags",
  async function (this: InfraWorld) {
    // Create 4 test features with valid tags
    const features = [
      {
        path: "apps/cli/features/infra/monorepo/init.feature",
        id: "cli-infra-monorepo-init",
      },
      {
        path: "apps/cli/features/infra/monorepo/create.feature",
        id: "cli-infra-monorepo-create",
      },
      {
        path: "apps/cli/features/infra/app/create.feature",
        id: "cli-infra-app-create",
      },
      {
        path: "apps/cli/features/pm/feature/list.feature",
        id: "cli-pm-feature-list",
      },
    ];

    for (const feature of features) {
      const fullPath = path.join(this.testDir!, feature.path);
      await fs.ensureDir(path.dirname(fullPath));

      const content = `@spec:id=${feature.id}
Feature: ${feature.id}
  Test feature

  Scenario: Test
    Given test
    When test
    Then test
`;
      await fs.writeFile(fullPath, content);
    }
  },
);

Given("all features are in the index", async function (this: InfraWorld) {
  const indexPath = path.join(this.testDir!, ".nodespec/pm/index.json");
  const index = await fs.readJson(indexPath);

  const features = await this.getAllFeatureFiles();
  for (const featureFile of features) {
    const content = await fs.readFile(featureFile, "utf-8");
    const match = content.match(/@spec:id=([\w-]+)/);
    if (!match) continue;

    const specId = match[1]!;
    const relativePath = path.relative(this.testDir!, featureFile);

    index.features[specId] = {
      id: specId,
      path: relativePath,
      title: `Feature ${specId}`,
      tags: [],
      lastModified: new Date().toISOString(),
    };
  }

  await fs.writeJson(indexPath, index);
});

// ============================================================================
// Complex State Setup Steps
// ============================================================================

Given(
  "the following feature validation states:",
  async function (this: InfraWorld, dataTable: DataTable) {
    const rows = dataTable.hashes();

    for (const row of rows) {
      const fullPath = path.join(this.testDir!, row.path!);

      // Create file if it should exist
      if (row.file_exists === "yes") {
        await fs.ensureDir(path.dirname(fullPath));

        let content = `Feature: Test Feature\n  Test\n\n  Scenario: Test\n    Given test\n`;

        // Add spec:id if needed
        if (row.has_spec_id === "yes") {
          const specId = this.pathToSpecId(row.path!);
          content = `@spec:id=${specId}\n${content}`;
        }

        await fs.writeFile(fullPath, content);
      }

      // Add to index if needed
      if (row.in_index === "yes") {
        const specId = this.pathToSpecId(row.path!);
        const indexPath = path.join(this.testDir!, ".nodespec/pm/index.json");
        const index = await fs.readJson(indexPath);

        index.features[specId] = {
          id: specId,
          path: row.path,
          title: "Test Feature",
          tags: [],
          lastModified: new Date().toISOString(),
        };

        await fs.writeJson(indexPath, index);
      }
    }
  },
);

Given(
  "a feature has tag {string}",
  async function (this: InfraWorld, tag: string) {
    const testPath = "apps/cli/features/test.feature";
    const fullPath = path.join(this.testDir!, testPath);
    await fs.ensureDir(path.dirname(fullPath));

    const content = `${tag}
Feature: Test Feature with Invalid ID
  Test

  Scenario: Test
    Given test
`;

    await fs.writeFile(fullPath, content);
  },
);

Given(
  "two features have the same {string}",
  async function (this: InfraWorld, tag: string) {
    const paths = [
      "apps/cli/features/duplicate1.feature",
      "apps/cli/features/duplicate2.feature",
    ];

    for (const featurePath of paths) {
      const fullPath = path.join(this.testDir!, featurePath);
      await fs.ensureDir(path.dirname(fullPath));

      const content = `${tag}
Feature: Duplicate Feature
  Test

  Scenario: Test
    Given test
`;

      await fs.writeFile(fullPath, content);
    }
  },
);

Given(
  "the index contains entry {string}",
  async function (this: InfraWorld, specId: string) {
    const indexPath = path.join(this.testDir!, ".nodespec/pm/index.json");
    const index = await fs.readJson(indexPath);

    index.features[specId] = {
      id: specId,
      path: "apps/cli/features/deleted.feature",
      title: "Deleted Feature",
      tags: [],
      lastModified: new Date().toISOString(),
    };

    await fs.writeJson(indexPath, index);
  },
);

Given("the feature file does not exist", async function (this: InfraWorld) {
  // Ensure the file referenced in the index doesn't exist
  const filePath = path.join(
    this.testDir!,
    "apps/cli/features/deleted.feature",
  );
  if (await fs.pathExists(filePath)) {
    await fs.remove(filePath);
  }
});

Given(
  "a feature file exists with @spec:id {string}",
  async function (this: InfraWorld, specId: string) {
    const featurePath = "apps/cli/features/orphan.feature";
    const fullPath = path.join(this.testDir!, featurePath);
    await fs.ensureDir(path.dirname(fullPath));

    const content = `@spec:id=${specId}
Feature: Orphan Feature
  Not in index

  Scenario: Test
    Given test
`;

    await fs.writeFile(fullPath, content);
  },
);

Given("the feature is not in the index", async function (this: InfraWorld) {
  // Simply don't add it to the index
  // Index was already initialized in background step
});

Given(
  "the index shows feature {string} at path {string}",
  async function (this: InfraWorld, specId: string, oldPath: string) {
    const indexPath = path.join(this.testDir!, ".nodespec/pm/index.json");
    const index = await fs.readJson(indexPath);

    index.features[specId] = {
      id: specId,
      path: oldPath,
      title: "Feature with wrong path",
      tags: [],
      lastModified: new Date().toISOString(),
    };

    await fs.writeJson(indexPath, index);
  },
);

Given(
  "the feature file is actually at {string}",
  async function (this: InfraWorld, actualPath: string) {
    const fullPath = path.join(this.testDir!, actualPath);
    await fs.ensureDir(path.dirname(fullPath));

    const specId = this.pathToSpecId(actualPath);
    const content = `@spec:id=${specId}
Feature: Feature at correct path
  Test

  Scenario: Test
    Given test
`;

    await fs.writeFile(fullPath, content);
  },
);

Given(
  "{int} features are missing @spec:id tags",
  async function (this: InfraWorld, count: number) {
    for (let i = 0; i < count; i++) {
      const featurePath = `apps/cli/features/missing-tag-${i}.feature`;
      const fullPath = path.join(this.testDir!, featurePath);
      await fs.ensureDir(path.dirname(fullPath));

      const content = `Feature: Feature Missing Tag ${i}
  Test

  Scenario: Test
    Given test
`;

      await fs.writeFile(fullPath, content);
    }
  },
);

Given(
  /the index has (\d+) stale entr(?:y|ies)/,
  async function (this: InfraWorld, count: string) {
    const countNum = parseInt(count, 10);
    const indexPath = path.join(this.testDir!, ".nodespec/pm/index.json");
    const index = await fs.readJson(indexPath);

    for (let i = 0; i < countNum; i++) {
      index.features[`stale-entry-${i}`] = {
        id: `stale-entry-${i}`,
        path: `apps/cli/features/stale-${i}.feature`,
        title: "Stale Feature",
        tags: [],
        lastModified: new Date().toISOString(),
      };
    }

    await fs.writeJson(indexPath, index);
  },
);

Given(
  /validation finds (\d+) errors?/,
  async function (this: InfraWorld, _count: string) {
    // Create a feature with missing @spec:id
    const featurePath = "apps/cli/features/error.feature";
    const fullPath = path.join(this.testDir!, featurePath);
    await fs.ensureDir(path.dirname(fullPath));

    const content = `Feature: Feature with Error
  Missing spec:id tag

  Scenario: Test
    Given test
`;

    await fs.writeFile(fullPath, content);
  },
);

Given("all features are valid", async function (this: InfraWorld) {
  // Create valid feature
  const featurePath = "apps/cli/features/valid.feature";
  const fullPath = path.join(this.testDir!, featurePath);
  await fs.ensureDir(path.dirname(fullPath));

  const specId = this.pathToSpecId(featurePath);
  const content = `@spec:id=${specId}
Feature: Valid Feature
  Test

  Scenario: Test
    Given test
`;

  await fs.writeFile(fullPath, content);

  // Add to index
  const indexPath = path.join(this.testDir!, ".nodespec/pm/index.json");
  const index = await fs.readJson(indexPath);

  index.features[specId] = {
    id: specId,
    path: featurePath,
    title: "Valid Feature",
    tags: [],
    lastModified: new Date().toISOString(),
  };

  await fs.writeJson(indexPath, index);
});

Given(
  /validation finds (\d+) warnings? but no errors/,
  async function (this: InfraWorld, _count: string) {
    // Create feature not in index (warning, not error)
    const featurePath = "apps/cli/features/warning.feature";
    const fullPath = path.join(this.testDir!, featurePath);
    await fs.ensureDir(path.dirname(fullPath));

    const specId = this.pathToSpecId(featurePath);
    const content = `@spec:id=${specId}
Feature: Feature with Warning
  Not in index

  Scenario: Test
    Given test
`;

    await fs.writeFile(fullPath, content);
    // Don't add to index - this creates a warning
  },
);

Given("the feature index is up to date", async function (this: InfraWorld) {
  // Index already up to date from background step
});

// ============================================================================
// Assertion Steps
// ============================================================================

Then(
  "I should see message {string}",
  function (this: InfraWorld, message: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include(
      message,
      `Expected to see message: ${message}`,
    );
  },
);

Then(
  "I should see error {string}",
  function (this: InfraWorld, errorMessage: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include(
      errorMessage,
      `Expected to see error: ${errorMessage}`,
    );
  },
);

Then(
  "I should see suggestion {string}",
  function (this: InfraWorld, suggestion: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include(
      suggestion,
      `Expected to see suggestion: ${suggestion}`,
    );
  },
);

Then(
  "I should see summary {string}",
  function (this: InfraWorld, summary: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include(
      summary,
      `Expected to see summary: ${summary}`,
    );
  },
);

Then(
  "I should see validation report:",
  function (this: InfraWorld, dataTable: DataTable) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    const rows = dataTable.hashes();

    for (const row of rows) {
      expect(allOutput).to.include(
        row.issue_type!,
        `Expected to see issue type: ${row.issue_type}`,
      );
      if (row.count) {
        expect(allOutput).to.include(
          row.count,
          `Expected to see count: ${row.count}`,
        );
      }
    }
  },
);

Then("I should see the paths of both features", function (this: InfraWorld) {
  const allOutput = [...this.stdout, ...this.stderr].join("\n");
  expect(allOutput).to.include("duplicate1.feature");
  expect(allOutput).to.include("duplicate2.feature");
});

Then(
  "I should see warning {string}",
  function (this: InfraWorld, warning: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include(
      warning,
      `Expected to see warning: ${warning}`,
    );
  },
);

Then("I should see {string}", function (this: InfraWorld, text: string) {
  const allOutput = [...this.stdout, ...this.stderr].join("\n");
  expect(allOutput).to.include(text, `Expected to see: ${text}`);
});

Then(
  "I should see a table with validation results",
  function (this: InfraWorld) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include("Valid features");
    expect(allOutput).to.include("Invalid features");
  },
);

Then("the output should be valid JSON", function (this: InfraWorld) {
  const stdout = this.stdout.join("\n");
  expect(() => JSON.parse(stdout)).to.not.throw();
});

Then(
  "the JSON should contain validation results with fields:",
  function (this: InfraWorld, dataTable: DataTable) {
    const stdout = this.stdout.join("\n");
    const json = JSON.parse(stdout);
    const fields = dataTable.hashes();

    for (const row of fields) {
      expect(json).to.have.property(
        row.field!,
        `Expected JSON to have field: ${row.field}`,
      );
    }
  },
);

Then(
  "missing tags should be automatically added",
  async function (this: InfraWorld) {
    const features = await this.getAllFeatureFiles();
    for (const featureFile of features) {
      const content = await fs.readFile(featureFile, "utf-8");
      expect(content).to.match(/@spec:id=[\w-]+/);
    }
  },
);

Then(
  "the command should exit with code {int}",
  function (this: InfraWorld, expectedCode: number) {
    expect(this.exitCode).to.equal(expectedCode);
  },
);

Then(
  "validation should use index without reading all files",
  function (this: InfraWorld) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include("Fast mode");
  },
);

Then(
  "all feature files should be read and validated",
  function (this: InfraWorld) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include("Full validation");
  },
);

// ============================================================================
// Helper Methods (extend World)
// ============================================================================

declare module "../support/world.js" {
  interface InfraWorld {
    getFeatureFiles(): Promise<string[]>;
    getAllFeatureFiles(): Promise<string[]>;
    pathToSpecId(featurePath: string): string;
  }
}
