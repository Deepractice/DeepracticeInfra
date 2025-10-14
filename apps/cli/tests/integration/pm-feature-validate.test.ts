/**
 * Integration tests for PM feature validate command
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execa } from "execa";
import fs from "fs-extra";
import path from "node:path";
import os from "node:os";

describe("PM Feature Validate Command Integration", () => {
  let testDir: string;
  let cliPath: string;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "nodespec-validate-integration-"),
    );

    // Get CLI path
    cliPath = path.resolve(process.cwd(), "dist/cli.js");

    // Create basic NodeSpec structure
    await fs.writeJson(path.join(testDir, "package.json"), {
      name: "test-monorepo",
      version: "1.0.0",
      private: true,
    });

    await fs.writeFile(
      path.join(testDir, "pnpm-workspace.yaml"),
      `packages:\n  - "apps/*"\n`,
    );

    // Initialize empty index
    const indexPath = path.join(testDir, ".nodespec/features/index.json");
    await fs.ensureDir(path.dirname(indexPath));
    await fs.writeJson(indexPath, {
      version: "1.0.0",
      features: {},
      lastUpdated: new Date().toISOString(),
    });
  });

  afterEach(async () => {
    if (testDir) {
      await fs.remove(testDir);
    }
  });

  describe("Single file validation", () => {
    it("should validate single feature file successfully", async () => {
      const featurePath = "apps/cli/features/test.feature";
      const fullPath = path.join(testDir, featurePath);
      await fs.ensureDir(path.dirname(fullPath));

      const content = `@spec:id=cli-test
Feature: Test Feature
  Test

  Scenario: Test
    Given test
`;

      await fs.writeFile(fullPath, content);

      // Add to index
      const indexPath = path.join(testDir, ".nodespec/features/index.json");
      const index = await fs.readJson(indexPath);
      index.features["cli-test"] = {
        id: "cli-test",
        path: featurePath,
        title: "Test Feature",
        tags: [],
        lastModified: new Date().toISOString(),
      };
      await fs.writeJson(indexPath, index);

      const result = await execa(
        "node",
        [cliPath, "pm", "feature", "validate", featurePath],
        {
          cwd: testDir,
          reject: false,
        },
      );

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("valid");
    });

    it("should detect missing @spec:id in single file", async () => {
      const featurePath = "apps/cli/features/test.feature";
      const fullPath = path.join(testDir, featurePath);
      await fs.ensureDir(path.dirname(fullPath));

      const content = `Feature: Test Feature
  Test

  Scenario: Test
    Given test
`;

      await fs.writeFile(fullPath, content);

      const result = await execa(
        "node",
        [cliPath, "pm", "feature", "validate", featurePath],
        {
          cwd: testDir,
          reject: false,
        },
      );

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain("Missing @spec:id tag");
    });

    it("should detect invalid @spec:id format", async () => {
      const featurePath = "apps/cli/features/test.feature";
      const fullPath = path.join(testDir, featurePath);
      await fs.ensureDir(path.dirname(fullPath));

      const content = `@spec:id=Invalid With Spaces
Feature: Test Feature
  Test

  Scenario: Test
    Given test
`;

      await fs.writeFile(fullPath, content);

      const result = await execa(
        "node",
        [cliPath, "pm", "feature", "validate", featurePath],
        {
          cwd: testDir,
          reject: false,
        },
      );

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain("Invalid @spec:id format");
      expect(result.stdout).toContain("kebab-case");
    });
  });

  describe("All features validation", () => {
    it("should validate all features successfully", async () => {
      const features = [
        { path: "apps/cli/features/test1.feature", id: "cli-test1" },
        { path: "apps/cli/features/test2.feature", id: "cli-test2" },
      ];

      const indexPath = path.join(testDir, ".nodespec/features/index.json");
      const index = await fs.readJson(indexPath);

      for (const feature of features) {
        const fullPath = path.join(testDir, feature.path);
        await fs.ensureDir(path.dirname(fullPath));

        const content = `@spec:id=${feature.id}
Feature: ${feature.id}
  Test

  Scenario: Test
    Given test
`;

        await fs.writeFile(fullPath, content);

        index.features[feature.id] = {
          id: feature.id,
          path: feature.path,
          title: feature.id,
          tags: [],
          lastModified: new Date().toISOString(),
        };
      }

      await fs.writeJson(indexPath, index);

      const result = await execa(
        "node",
        [cliPath, "pm", "feature", "validate", "--all"],
        {
          cwd: testDir,
          reject: false,
        },
      );

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("All");
      expect(result.stdout).toContain("valid");
    });

    it("should detect multiple issues", async () => {
      // Feature without @spec:id
      const noTagPath = "apps/cli/features/notag.feature";
      const noTagFull = path.join(testDir, noTagPath);
      await fs.ensureDir(path.dirname(noTagFull));
      await fs.writeFile(
        noTagFull,
        `Feature: No Tag\n  Test\n\n  Scenario: Test\n    Given test\n`,
      );

      // Valid feature
      const validPath = "apps/cli/features/valid.feature";
      const validFull = path.join(testDir, validPath);
      await fs.ensureDir(path.dirname(validFull));
      await fs.writeFile(
        validFull,
        `@spec:id=cli-valid\nFeature: Valid\n  Test\n\n  Scenario: Test\n    Given test\n`,
      );

      const indexPath = path.join(testDir, ".nodespec/features/index.json");
      const index = await fs.readJson(indexPath);
      index.features["cli-valid"] = {
        id: "cli-valid",
        path: validPath,
        title: "Valid",
        tags: [],
        lastModified: new Date().toISOString(),
      };
      await fs.writeJson(indexPath, index);

      const result = await execa(
        "node",
        [cliPath, "pm", "feature", "validate", "--all"],
        {
          cwd: testDir,
          reject: false,
        },
      );

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain("Missing @spec:id");
    });

    it("should detect duplicate @spec:id", async () => {
      const features = [
        "apps/cli/features/dup1.feature",
        "apps/cli/features/dup2.feature",
      ];

      for (const featurePath of features) {
        const fullPath = path.join(testDir, featurePath);
        await fs.ensureDir(path.dirname(fullPath));

        const content = `@spec:id=cli-duplicate
Feature: Duplicate
  Test

  Scenario: Test
    Given test
`;

        await fs.writeFile(fullPath, content);
      }

      const result = await execa(
        "node",
        [cliPath, "pm", "feature", "validate", "--all"],
        {
          cwd: testDir,
          reject: false,
        },
      );

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain("Duplicate @spec:id");
      expect(result.stdout).toContain("cli-duplicate");
    });
  });

  describe("Index consistency checks", () => {
    it("should detect stale index entry", async () => {
      const indexPath = path.join(testDir, ".nodespec/features/index.json");
      const index = await fs.readJson(indexPath);

      index.features["cli-stale"] = {
        id: "cli-stale",
        path: "apps/cli/features/stale.feature",
        title: "Stale",
        tags: [],
        lastModified: new Date().toISOString(),
      };

      await fs.writeJson(indexPath, index);

      const result = await execa(
        "node",
        [cliPath, "pm", "feature", "validate", "--all"],
        {
          cwd: testDir,
          reject: false,
        },
      );

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain("Stale index entry");
      expect(result.stdout).toContain("cli-stale");
    });

    it("should detect feature not in index", async () => {
      const featurePath = "apps/cli/features/orphan.feature";
      const fullPath = path.join(testDir, featurePath);
      await fs.ensureDir(path.dirname(fullPath));

      const content = `@spec:id=cli-orphan
Feature: Orphan
  Test

  Scenario: Test
    Given test
`;

      await fs.writeFile(fullPath, content);

      const result = await execa(
        "node",
        [cliPath, "pm", "feature", "validate", "--all"],
        {
          cwd: testDir,
          reject: false,
        },
      );

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain("Feature not in index");
      expect(result.stdout).toContain("cli-orphan");
    });

    it("should detect path mismatch", async () => {
      const featurePath = "apps/cli/features/mismatch.feature";
      const fullPath = path.join(testDir, featurePath);
      await fs.ensureDir(path.dirname(fullPath));

      const content = `@spec:id=cli-mismatch
Feature: Mismatch
  Test

  Scenario: Test
    Given test
`;

      await fs.writeFile(fullPath, content);

      const indexPath = path.join(testDir, ".nodespec/features/index.json");
      const index = await fs.readJson(indexPath);
      index.features["cli-mismatch"] = {
        id: "cli-mismatch",
        path: "apps/cli/features/wrong/path.feature",
        title: "Mismatch",
        tags: [],
        lastModified: new Date().toISOString(),
      };
      await fs.writeJson(indexPath, index);

      const result = await execa(
        "node",
        [cliPath, "pm", "feature", "validate", "--all"],
        {
          cwd: testDir,
          reject: false,
        },
      );

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain("Path mismatch");
      expect(result.stdout).toContain("cli-mismatch");
    });
  });

  describe("Output formats", () => {
    it("should output table format by default", async () => {
      const featurePath = "apps/cli/features/test.feature";
      const fullPath = path.join(testDir, featurePath);
      await fs.ensureDir(path.dirname(fullPath));

      const content = `@spec:id=cli-test
Feature: Test
  Test

  Scenario: Test
    Given test
`;

      await fs.writeFile(fullPath, content);

      const indexPath = path.join(testDir, ".nodespec/features/index.json");
      const index = await fs.readJson(indexPath);
      index.features["cli-test"] = {
        id: "cli-test",
        path: featurePath,
        title: "Test",
        tags: [],
        lastModified: new Date().toISOString(),
      };
      await fs.writeJson(indexPath, index);

      const result = await execa(
        "node",
        [cliPath, "pm", "feature", "validate", "--all"],
        {
          cwd: testDir,
          reject: false,
        },
      );

      expect(result.stdout).toContain("Valid features");
      expect(result.stdout).toContain("Invalid features");
    });

    it("should output JSON format", async () => {
      const featurePath = "apps/cli/features/test.feature";
      const fullPath = path.join(testDir, featurePath);
      await fs.ensureDir(path.dirname(fullPath));

      const content = `@spec:id=cli-test
Feature: Test
  Test

  Scenario: Test
    Given test
`;

      await fs.writeFile(fullPath, content);

      const indexPath = path.join(testDir, ".nodespec/features/index.json");
      const index = await fs.readJson(indexPath);
      index.features["cli-test"] = {
        id: "cli-test",
        path: featurePath,
        title: "Test",
        tags: [],
        lastModified: new Date().toISOString(),
      };
      await fs.writeJson(indexPath, index);

      const result = await execa(
        "node",
        [cliPath, "pm", "feature", "validate", "--all", "--format", "json"],
        {
          cwd: testDir,
          reject: false,
        },
      );

      expect(() => JSON.parse(result.stdout)).not.toThrow();
      const json = JSON.parse(result.stdout);
      expect(json).toHaveProperty("valid");
      expect(json).toHaveProperty("validCount");
      expect(json).toHaveProperty("invalidCount");
      expect(json).toHaveProperty("errors");
      expect(json).toHaveProperty("warnings");
      expect(json).toHaveProperty("suggestions");
    });
  });

  describe("Auto-fix", () => {
    it("should auto-fix missing @spec:id with --fix flag", async () => {
      const featurePath = "apps/cli/features/infra/test.feature";
      const fullPath = path.join(testDir, featurePath);
      await fs.ensureDir(path.dirname(fullPath));

      const content = `Feature: Test
  Test

  Scenario: Test
    Given test
`;

      await fs.writeFile(fullPath, content);

      const result = await execa(
        "node",
        [cliPath, "pm", "feature", "validate", featurePath, "--fix"],
        {
          cwd: testDir,
          reject: false,
        },
      );

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Fixed");

      // Verify file was updated
      const updatedContent = await fs.readFile(fullPath, "utf-8");
      expect(updatedContent).toMatch(/@spec:id=cli-infra-test/);
    });
  });

  describe("Strict mode", () => {
    it("should fail on warnings in strict mode", async () => {
      const featurePath = "apps/cli/features/warning.feature";
      const fullPath = path.join(testDir, featurePath);
      await fs.ensureDir(path.dirname(fullPath));

      const content = `@spec:id=cli-warning
Feature: Warning
  Test

  Scenario: Test
    Given test
`;

      await fs.writeFile(fullPath, content);
      // Don't add to index - creates warning

      const result = await execa(
        "node",
        [cliPath, "pm", "feature", "validate", "--all", "--strict"],
        {
          cwd: testDir,
          reject: false,
        },
      );

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain("Strict mode");
    });
  });

  describe("Performance modes", () => {
    it("should support fast mode", async () => {
      const featurePath = "apps/cli/features/fast.feature";
      const fullPath = path.join(testDir, featurePath);
      await fs.ensureDir(path.dirname(fullPath));

      const content = `@spec:id=cli-fast
Feature: Fast
  Test

  Scenario: Test
    Given test
`;

      await fs.writeFile(fullPath, content);

      const indexPath = path.join(testDir, ".nodespec/features/index.json");
      const index = await fs.readJson(indexPath);
      index.features["cli-fast"] = {
        id: "cli-fast",
        path: featurePath,
        title: "Fast",
        tags: [],
        lastModified: new Date().toISOString(),
      };
      await fs.writeJson(indexPath, index);

      const result = await execa(
        "node",
        [cliPath, "pm", "feature", "validate", "--all", "--fast"],
        {
          cwd: testDir,
          reject: false,
        },
      );

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Fast mode");
    });

    it("should support full validation with --no-cache", async () => {
      const featurePath = "apps/cli/features/nocache.feature";
      const fullPath = path.join(testDir, featurePath);
      await fs.ensureDir(path.dirname(fullPath));

      const content = `@spec:id=cli-nocache
Feature: No Cache
  Test

  Scenario: Test
    Given test
`;

      await fs.writeFile(fullPath, content);

      const result = await execa(
        "node",
        [cliPath, "pm", "feature", "validate", "--all", "--no-cache"],
        {
          cwd: testDir,
          reject: false,
        },
      );

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Full validation");
    });
  });

  describe("Exit codes", () => {
    it("should exit with 0 on success", async () => {
      const featurePath = "apps/cli/features/success.feature";
      const fullPath = path.join(testDir, featurePath);
      await fs.ensureDir(path.dirname(fullPath));

      const content = `@spec:id=cli-success
Feature: Success
  Test

  Scenario: Test
    Given test
`;

      await fs.writeFile(fullPath, content);

      const indexPath = path.join(testDir, ".nodespec/features/index.json");
      const index = await fs.readJson(indexPath);
      index.features["cli-success"] = {
        id: "cli-success",
        path: featurePath,
        title: "Success",
        tags: [],
        lastModified: new Date().toISOString(),
      };
      await fs.writeJson(indexPath, index);

      const result = await execa(
        "node",
        [cliPath, "pm", "feature", "validate", "--all"],
        {
          cwd: testDir,
          reject: false,
        },
      );

      expect(result.exitCode).toBe(0);
    });

    it("should exit with 1 on failure", async () => {
      const featurePath = "apps/cli/features/fail.feature";
      const fullPath = path.join(testDir, featurePath);
      await fs.ensureDir(path.dirname(fullPath));

      const content = `Feature: Fail
  Test

  Scenario: Test
    Given test
`;

      await fs.writeFile(fullPath, content);

      const result = await execa(
        "node",
        [cliPath, "pm", "feature", "validate", "--all"],
        {
          cwd: testDir,
          reject: false,
        },
      );

      expect(result.exitCode).toBe(1);
    });
  });
});
