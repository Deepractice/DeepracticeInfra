/**
 * Unit tests for FeatureValidator
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import os from "node:os";
import { FeatureValidator } from "../../../../../src/core/pm/FeatureValidator.js";
import { FeatureIndexManager } from "../../../../../src/core/pm/FeatureIndexManager.js";

describe("FeatureValidator", () => {
  let testDir: string;
  let validator: FeatureValidator;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), "validator-test-"));
    validator = new FeatureValidator(testDir);

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
    // Clean up test directory
    if (testDir) {
      await fs.remove(testDir);
    }
  });

  describe("validateFile", () => {
    it("should validate a feature with correct @spec:id tag", async () => {
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
      const indexManager = new FeatureIndexManager(testDir);
      const index = await indexManager.load();
      index.features["cli-test"] = {
        id: "cli-test",
        path: featurePath,
        title: "Test Feature",
        tags: ["@spec:id=cli-test"],
        lastModified: new Date().toISOString(),
      };
      await fs.writeJson(
        path.join(testDir, ".nodespec/features/index.json"),
        index,
      );

      const result = await validator.validateFile(featurePath);

      expect(result.valid).toBe(true);
      expect(result.validCount).toBe(1);
      expect(result.invalidCount).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect missing @spec:id tag", async () => {
      const featurePath = "apps/cli/features/test.feature";
      const fullPath = path.join(testDir, featurePath);
      await fs.ensureDir(path.dirname(fullPath));

      const content = `Feature: Test Feature
  Test

  Scenario: Test
    Given test
`;

      await fs.writeFile(fullPath, content);

      const result = await validator.validateFile(featurePath);

      expect(result.valid).toBe(false);
      expect(result.invalidCount).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]!.category).toBe("missing-spec-id");
      expect(result.errors[0]!.message).toBe("Missing @spec:id tag");
      expect(result.suggestions).toContain(
        `Run 'nodespec pm feature init ${featurePath}'`,
      );
    });

    it("should detect invalid @spec:id format", async () => {
      const featurePath = "apps/cli/features/test.feature";
      const fullPath = path.join(testDir, featurePath);
      await fs.ensureDir(path.dirname(fullPath));

      const content = `@spec:id=Invalid ID With Spaces
Feature: Test Feature
  Test

  Scenario: Test
    Given test
`;

      await fs.writeFile(fullPath, content);

      const result = await validator.validateFile(featurePath);

      expect(result.valid).toBe(false);
      expect(result.invalidCount).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]!.category).toBe("invalid-spec-id-format");
      expect(result.errors[0]!.message).toContain("kebab-case");
    });

    it("should detect feature not in index", async () => {
      const featurePath = "apps/cli/features/test.feature";
      const fullPath = path.join(testDir, featurePath);
      await fs.ensureDir(path.dirname(fullPath));

      const content = `@spec:id=cli-test-orphan
Feature: Test Feature
  Test

  Scenario: Test
    Given test
`;

      await fs.writeFile(fullPath, content);

      const result = await validator.validateFile(featurePath);

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]!.category).toBe("missing-from-index");
      expect(result.suggestions).toContain(
        "Run 'nodespec pm feature init --all' to update index",
      );
    });

    it("should detect path mismatch", async () => {
      const featurePath = "apps/cli/features/test.feature";
      const fullPath = path.join(testDir, featurePath);
      await fs.ensureDir(path.dirname(fullPath));

      const content = `@spec:id=cli-test-mismatch
Feature: Test Feature
  Test

  Scenario: Test
    Given test
`;

      await fs.writeFile(fullPath, content);

      // Add to index with wrong path
      const indexPath = path.join(testDir, ".nodespec/features/index.json");
      const index = await fs.readJson(indexPath);
      index.features["cli-test-mismatch"] = {
        id: "cli-test-mismatch",
        path: "apps/cli/features/wrong/path.feature",
        title: "Test Feature",
        tags: [],
        lastModified: new Date().toISOString(),
      };
      await fs.writeJson(indexPath, index);

      const result = await validator.validateFile(featurePath);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]!.category).toBe("path-mismatch");
      expect(result.errors[0]!.details?.expected).toBe(
        "apps/cli/features/wrong/path.feature",
      );
      expect(result.errors[0]!.details?.found).toBe(featurePath);
    });

    it("should auto-fix missing @spec:id with --fix flag", async () => {
      const featurePath = "apps/cli/features/infra/test.feature";
      const fullPath = path.join(testDir, featurePath);
      await fs.ensureDir(path.dirname(fullPath));

      const content = `Feature: Test Feature
  Test

  Scenario: Test
    Given test
`;

      await fs.writeFile(fullPath, content);

      const result = await validator.validateFile(featurePath, { fix: true });

      expect(result.valid).toBe(true);
      expect(result.validCount).toBe(1);
      expect(result.invalidCount).toBe(0);
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions[0]).toContain("Fixed");

      // Verify tag was added
      const updatedContent = await fs.readFile(fullPath, "utf-8");
      expect(updatedContent).toMatch(/@spec:id=cli-infra-test/);
    });

    it("should handle non-existent file", async () => {
      const result = await validator.validateFile("non-existent.feature");

      expect(result.valid).toBe(false);
      expect(result.invalidCount).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]!.message).toContain("not found");
    });
  });

  describe("validateAll", () => {
    it("should validate all features successfully", async () => {
      // Create multiple valid features
      const features = [
        { path: "apps/cli/features/test1.feature", id: "cli-test1" },
        { path: "apps/cli/features/test2.feature", id: "cli-test2" },
        { path: "apps/cli/features/test3.feature", id: "cli-test3" },
      ];

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
      }

      // Update index
      const indexPath = path.join(testDir, ".nodespec/features/index.json");
      const index = await fs.readJson(indexPath);
      for (const feature of features) {
        index.features[feature.id] = {
          id: feature.id,
          path: feature.path,
          title: feature.id,
          tags: [],
          lastModified: new Date().toISOString(),
        };
      }
      await fs.writeJson(indexPath, index);

      const result = await validator.validateAll();

      expect(result.valid).toBe(true);
      expect(result.validCount).toBe(3);
      expect(result.invalidCount).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect multiple validation issues", async () => {
      // Feature with no @spec:id
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

      // Add valid feature to index
      const indexPath = path.join(testDir, ".nodespec/features/index.json");
      const index = await fs.readJson(indexPath);
      index.features["cli-valid"] = {
        id: "cli-valid",
        path: validPath,
        title: "Valid",
        tags: [],
        lastModified: new Date().toISOString(),
      };

      // Add stale entry
      index.features["cli-stale"] = {
        id: "cli-stale",
        path: "apps/cli/features/stale.feature",
        title: "Stale",
        tags: [],
        lastModified: new Date().toISOString(),
      };

      await fs.writeJson(indexPath, index);

      const result = await validator.validateAll();

      expect(result.valid).toBe(false);
      expect(result.validCount).toBe(1);
      expect(result.invalidCount).toBeGreaterThan(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.warnings.length).toBeGreaterThan(0);
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

      const result = await validator.validateAll();

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      const duplicateError = result.errors.find(
        (e) => e.category === "duplicate-spec-id",
      );
      expect(duplicateError).toBeDefined();
      expect(duplicateError!.message).toContain("cli-duplicate");
      expect(duplicateError!.details?.duplicatePaths).toHaveLength(2);
    });

    it("should detect stale index entries", async () => {
      const indexPath = path.join(testDir, ".nodespec/features/index.json");
      const index = await fs.readJson(indexPath);

      // Add entry for non-existent file
      index.features["cli-missing"] = {
        id: "cli-missing",
        path: "apps/cli/features/missing.feature",
        title: "Missing",
        tags: [],
        lastModified: new Date().toISOString(),
      };

      await fs.writeJson(indexPath, index);

      const result = await validator.validateAll();

      expect(result.warnings.length).toBeGreaterThan(0);
      const staleWarning = result.warnings.find(
        (w) => w.category === "stale-index-entry",
      );
      expect(staleWarning).toBeDefined();
      expect(staleWarning!.message).toContain("cli-missing");
    });

    it("should auto-fix multiple issues with --fix flag", async () => {
      // Create features without @spec:id
      const features = [
        "apps/cli/features/fix1.feature",
        "apps/cli/features/fix2.feature",
      ];

      for (const featurePath of features) {
        const fullPath = path.join(testDir, featurePath);
        await fs.ensureDir(path.dirname(fullPath));

        const content = `Feature: Need Fix
  Test

  Scenario: Test
    Given test
`;

        await fs.writeFile(fullPath, content);
      }

      const result = await validator.validateAll({ fix: true });

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions[0]).toContain("Fixed");

      // Verify tags were added
      for (const featurePath of features) {
        const fullPath = path.join(testDir, featurePath);
        const content = await fs.readFile(fullPath, "utf-8");
        expect(content).toMatch(/@spec:id=/);
      }
    });

    it("should support strict mode", async () => {
      // Create feature not in index (warning only)
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

      const result = await validator.validateAll({ strict: true });

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.valid).toBe(false); // Strict mode treats warnings as errors
    });

    it("should use fast mode with index cache", async () => {
      // Create indexed feature
      const featurePath = "apps/cli/features/cached.feature";
      const fullPath = path.join(testDir, featurePath);
      await fs.ensureDir(path.dirname(fullPath));

      const content = `@spec:id=cli-cached
Feature: Cached
  Test

  Scenario: Test
    Given test
`;

      await fs.writeFile(fullPath, content);

      const indexPath = path.join(testDir, ".nodespec/features/index.json");
      const index = await fs.readJson(indexPath);
      index.features["cli-cached"] = {
        id: "cli-cached",
        path: featurePath,
        title: "Cached",
        tags: [],
        lastModified: new Date().toISOString(),
      };
      await fs.writeJson(indexPath, index);

      const result = await validator.validateAll({ fast: true });

      expect(result.valid).toBe(true);
      expect(result.validCount).toBeGreaterThan(0);
    });

    it("should force full validation with --no-cache", async () => {
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

      const result = await validator.validateAll({ noCache: true });

      expect(result.validCount).toBeGreaterThan(0);
    });

    it("should generate appropriate suggestions", async () => {
      // Create feature without @spec:id
      const noTagPath = "apps/cli/features/notag.feature";
      const noTagFull = path.join(testDir, noTagPath);
      await fs.ensureDir(path.dirname(noTagFull));
      await fs.writeFile(
        noTagFull,
        `Feature: No Tag\n  Test\n\n  Scenario: Test\n    Given test\n`,
      );

      // Add stale entry
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

      const result = await validator.validateAll();

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(
        result.suggestions.some((s) =>
          s.includes("nodespec pm feature init --all"),
        ),
      ).toBe(true);
    });
  });

  describe("isValidKebabCase", () => {
    it("should validate kebab-case format", async () => {
      const validCases = [
        "cli-test",
        "cli-infra-monorepo-init",
        "test-123",
        "a",
        "a-b",
      ];

      const invalidCases = [
        "Invalid ID",
        "Invalid_ID",
        "InvalidID",
        "invalid-ID",
        "invalid-",
        "-invalid",
        "invalid--test",
      ];

      for (const testCase of validCases) {
        const featurePath = "apps/cli/features/test.feature";
        const fullPath = path.join(testDir, featurePath);
        await fs.ensureDir(path.dirname(fullPath));

        const content = `@spec:id=${testCase}
Feature: Test
  Test

  Scenario: Test
    Given test
`;

        await fs.writeFile(fullPath, content);
        const result = await validator.validateFile(featurePath);

        expect(
          result.errors.find((e) => e.category === "invalid-spec-id-format"),
        ).toBeUndefined();
      }

      for (const testCase of invalidCases) {
        const featurePath = "apps/cli/features/test.feature";
        const fullPath = path.join(testDir, featurePath);
        await fs.ensureDir(path.dirname(fullPath));

        const content = `@spec:id=${testCase}
Feature: Test
  Test

  Scenario: Test
    Given test
`;

        await fs.writeFile(fullPath, content);
        const result = await validator.validateFile(featurePath);

        expect(
          result.errors.find((e) => e.category === "invalid-spec-id-format"),
        ).toBeDefined();
      }
    });
  });
});
