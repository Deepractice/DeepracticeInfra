/**
 * Step definitions for PM feature init command
 */
import { Given, Then, DataTable } from "@deepracticex/vitest-cucumber";
import { expect } from "chai";
import fs from "fs-extra";
import path from "node:path";
import type { InfraWorld } from "../support/world.js";

// Helper: Create a basic NodeSpec monorepo structure
async function createNodeSpecMonorepo(testDir: string): Promise<void> {
  // Create package.json with @deepracticex/nodespec-core dependency
  await fs.writeJson(path.join(testDir, "package.json"), {
    name: "test-monorepo",
    version: "1.0.0",
    private: true,
    workspaces: ["apps/*", "packages/*"],
    devDependencies: {
      "@deepracticex/nodespec-core": "latest",
    },
  });

  // Create pnpm-workspace.yaml
  await fs.writeFile(
    path.join(testDir, "pnpm-workspace.yaml"),
    "packages:\n  - 'apps/*'\n  - 'packages/*'\n  - 'services/*'\n",
  );

  // Create basic directory structure
  await fs.ensureDir(path.join(testDir, "apps"));
  await fs.ensureDir(path.join(testDir, "packages"));
  await fs.ensureDir(path.join(testDir, "services"));
}

// Helper: Create a feature file
async function createFeatureFile(
  testDir: string,
  relativePath: string,
  options: { withSpecId?: string; title?: string } = {},
): Promise<void> {
  const featurePath = path.join(testDir, relativePath);
  await fs.ensureDir(path.dirname(featurePath));

  const title = options.title || "Test Feature";
  const specIdTag = options.withSpecId
    ? `@spec:id=${options.withSpecId}\n`
    : "";

  const content = `${specIdTag}Feature: ${title}
  As a user
  I want to test something
  So that I can verify behavior

  Scenario: Test scenario
    Given a precondition
    When an action occurs
    Then the result is verified
`;

  await fs.writeFile(featurePath, content);
}

// Helper: Parse feature file to extract @spec:id tag
async function getFeatureSpecId(featurePath: string): Promise<string | null> {
  const content = await fs.readFile(featurePath, "utf-8");
  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("@spec:id=")) {
      return trimmed.replace("@spec:id=", "");
    }
  }

  return null;
}

// Helper: Get feature index path
function getFeatureIndexPath(testDir: string): string {
  return path.join(testDir, ".nodespec", "pm", "index.json");
}

// Background steps

Given(
  "I am not in a NodeSpec monorepo directory",
  async function (this: InfraWorld) {
    if (!this.testDir) {
      const tmpDir = await fs.mkdtemp(
        path.join((await import("node:os")).default.tmpdir(), "nodespec-test-"),
      );
      this.testDir = tmpDir.toString();
      this.originalCwd = process.cwd();
    }
    // Just create an empty directory or a non-NodeSpec package.json
    await fs.writeJson(path.join(this.testDir, "package.json"), {
      name: "regular-project",
      version: "1.0.0",
    });
  },
);

// Given steps - feature file creation
Given(
  "a feature file exists at {string}",
  async function (this: InfraWorld, featurePath: string) {
    await createFeatureFile(this.testDir!, featurePath);
    // Store the feature path for later assertions
    this.set("lastFeaturePath", featurePath);
  },
);

Given("the feature has no @spec:id tag", async function (this: InfraWorld) {
  // This is implicitly handled by createFeatureFile without withSpecId option
  // No action needed here, just validation
});

Given(
  "the feature has tag {string}",
  async function (this: InfraWorld, tag: string) {
    // Extract spec:id from tag like "@spec:id=cli-infra-monorepo-init"
    const specIdMatch = tag.match(/@spec:id=(.+)/);
    if (!specIdMatch) {
      throw new Error(`Invalid tag format: ${tag}`);
    }

    const specId = specIdMatch[1];
    // Get the last created feature path from context
    const lastFeaturePath = this.get("lastFeaturePath") as string;
    if (!lastFeaturePath) {
      throw new Error("No feature file path in context");
    }

    // Recreate the feature file with spec:id
    await createFeatureFile(this.testDir!, lastFeaturePath, {
      withSpecId: specId,
    });
  },
);

Given(
  "the following feature files exist without @spec:id:",
  async function (this: InfraWorld, dataTable: DataTable) {
    const rows = dataTable.hashes();
    for (const row of rows) {
      if (!row.path) continue;
      await createFeatureFile(this.testDir!, row.path);
    }
  },
);

Given(
  "the following feature files exist:",
  async function (this: InfraWorld, dataTable: DataTable) {
    const rows = dataTable.hashes();
    for (const row of rows) {
      if (!row.path) continue;
      const hasSpecId = row.has_spec_id === "yes";
      const specId = hasSpecId
        ? this.generateSpecIdFromPath(row.path)
        : undefined;
      await createFeatureFile(this.testDir!, row.path, {
        withSpecId: specId,
      });
    }
  },
);

Given(
  "no feature file exists at {string}",
  async function (this: InfraWorld, featurePath: string) {
    // Ensure file does not exist
    const fullPath = path.join(this.testDir!, featurePath);
    if (await fs.pathExists(fullPath)) {
      await fs.remove(fullPath);
    }
  },
);

Given("no feature index exists", async function (this: InfraWorld) {
  const indexPath = getFeatureIndexPath(this.testDir!);
  if (await fs.pathExists(indexPath)) {
    await fs.remove(indexPath);
  }
});

Given(
  "a feature index exists with {int} entries",
  async function (this: InfraWorld, entryCount: number) {
    const indexPath = getFeatureIndexPath(this.testDir!);
    await fs.ensureDir(path.dirname(indexPath));

    // Create dummy index with specified number of entries
    const features: Record<string, any> = {};
    for (let i = 0; i < entryCount; i++) {
      const id = `test-feature-${i}`;
      features[id] = {
        id,
        path: `test/feature-${i}.feature`,
        title: `Test Feature ${i}`,
        tags: [],
        lastModified: new Date().toISOString(),
      };
    }

    const index = {
      version: "1.0.0",
      features,
      lastUpdated: new Date().toISOString(),
    };

    await fs.writeJson(indexPath, index, { spaces: 2 });
  },
);

// Then steps - @spec:id tag verification
Then(
  "the feature should have tag {string}",
  async function (this: InfraWorld, expectedTag: string) {
    // Extract spec:id from tag
    const specIdMatch = expectedTag.match(/@spec:id=(.+)/);
    if (!specIdMatch) {
      throw new Error(`Invalid tag format: ${expectedTag}`);
    }

    const expectedSpecId = specIdMatch[1];
    const lastFeaturePath = this.get("lastFeaturePath") as string;
    if (!lastFeaturePath) {
      throw new Error("No feature file path in context");
    }

    const featurePath = path.join(this.testDir!, lastFeaturePath);
    const actualSpecId = await getFeatureSpecId(featurePath);

    expect(actualSpecId).to.equal(
      expectedSpecId,
      `Feature should have @spec:id=${expectedSpecId}`,
    );
  },
);

Then(
  "the feature should still have tag {string}",
  async function (this: InfraWorld, expectedTag: string) {
    // Same as "the feature should have tag"
    const specIdMatch = expectedTag.match(/@spec:id=(.+)/);
    if (!specIdMatch) {
      throw new Error(`Invalid tag format: ${expectedTag}`);
    }

    const expectedSpecId = specIdMatch[1];
    const lastFeaturePath = this.get("lastFeaturePath") as string;
    if (!lastFeaturePath) {
      throw new Error("No feature file path in context");
    }

    const featurePath = path.join(this.testDir!, lastFeaturePath);
    const actualSpecId = await getFeatureSpecId(featurePath);

    expect(actualSpecId).to.equal(
      expectedSpecId,
      `Feature should still have @spec:id=${expectedSpecId}`,
    );
  },
);

Then(
  "all features should have @spec:id tags",
  async function (this: InfraWorld) {
    // Find all feature files
    const featureFiles = await this.findFeatureFiles(this.testDir!);

    for (const featureFile of featureFiles) {
      const specId = await getFeatureSpecId(featureFile);
      expect(specId).to.not.be.null;
      expect(specId).to.have.length.greaterThan(0);
    }
  },
);

// Then steps - feature index verification
Then(
  "the feature index should contain entry:",
  async function (this: InfraWorld, dataTable: DataTable) {
    const indexPath = getFeatureIndexPath(this.testDir!);
    expect(await fs.pathExists(indexPath)).to.be.true;

    const index = await fs.readJson(indexPath);
    const rows = dataTable.hashes();

    for (const row of rows) {
      if (!row.id) continue;
      const entry = index.features[row.id];
      expect(entry, `Index should contain entry for ${row.id}`).to.exist;
      expect(entry.id).to.equal(row.id);
      expect(entry.path).to.equal(row.path);
    }
  },
);

Then(
  "the feature index should contain {int} entries",
  async function (this: InfraWorld, expectedCount: number) {
    const indexPath = getFeatureIndexPath(this.testDir!);
    expect(await fs.pathExists(indexPath)).to.be.true;

    const index = await fs.readJson(indexPath);
    const actualCount = Object.keys(index.features).length;

    expect(actualCount).to.equal(
      expectedCount,
      `Feature index should contain ${expectedCount} entries`,
    );
  },
);

Then(
  "{string} should exist",
  async function (this: InfraWorld, filePath: string) {
    const fullPath = path.join(this.testDir!, filePath);
    const exists = await fs.pathExists(fullPath);
    expect(exists, `File ${filePath} should exist`).to.be.true;
  },
);

Then(
  "the index should have version {string}",
  async function (this: InfraWorld, expectedVersion: string) {
    const indexPath = getFeatureIndexPath(this.testDir!);
    expect(await fs.pathExists(indexPath)).to.be.true;

    const index = await fs.readJson(indexPath);
    expect(index.version).to.equal(expectedVersion);
  },
);

// Custom World methods (extend InfraWorld in runtime)
declare module "../support/world.js" {
  interface InfraWorld {
    generateSpecIdFromPath(featurePath: string): string;
    findFeatureFiles(rootDir: string): Promise<string[]>;
  }
}
