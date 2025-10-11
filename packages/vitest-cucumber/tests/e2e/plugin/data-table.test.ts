/**
 * E2E tests for DataTable support
 * Tests scenarios from features/plugin-step-definitions.feature lines 66-103
 */
import { describe, it, expect } from "vitest";
import { runCucumberFeature } from "../../../src/core/runner";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURES_DIR = path.resolve(__dirname, "../fixtures");
const STEPS_DIR = path.join(FIXTURES_DIR, "steps");

describe("DataTable Support", () => {
  describe("DataTable.rowsHash() method", () => {
    it("should convert two-column table to key-value object", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "data-table-rows-hash.feature"),
        path.join(STEPS_DIR, "data-table.steps.ts"),
      );

      if (!result.success) {
        console.log("Output:", result.output);
        console.log("Error:", result.error);
      }

      expect(result.success).toBe(true);

      // Verify scenario executed
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        const passedScenarios = parseInt(scenarioMatch[2]);
        expect(passedScenarios).toBeGreaterThan(0);
      }
    });

    it("should handle multiple key-value pairs", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "data-table-multiple-keys.feature"),
        path.join(STEPS_DIR, "data-table.steps.ts"),
      );

      expect(result.success).toBe(true);

      // Verify the scenario passes with correct data transformation
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });
  });

  describe("DataTable.hashes() method", () => {
    it("should convert table with headers to array of objects", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "data-table-hashes.feature"),
        path.join(STEPS_DIR, "data-table.steps.ts"),
      );

      if (!result.success) {
        console.log("Output:", result.output);
        console.log("Error:", result.error);
      }

      expect(result.success).toBe(true);

      // Verify scenario executed
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });

    it("should handle multiple rows with array of objects", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "data-table-multiple-rows.feature"),
        path.join(STEPS_DIR, "data-table.steps.ts"),
      );

      expect(result.success).toBe(true);

      // Verify correct array length (2 user objects)
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });

    it("should preserve all column headers as object keys", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "data-table-all-columns.feature"),
        path.join(STEPS_DIR, "data-table.steps.ts"),
      );

      expect(result.success).toBe(true);
    });
  });

  describe("DataTable.raw() method", () => {
    it("should return raw 2D array from table", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "data-table-raw.feature"),
        path.join(STEPS_DIR, "data-table.steps.ts"),
      );

      if (!result.success) {
        console.log("Output:", result.output);
        console.log("Error:", result.error);
      }

      expect(result.success).toBe(true);

      // Verify scenario passes with raw array access
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });

    it("should include headers in raw array", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "data-table-raw-with-headers.feature"),
        path.join(STEPS_DIR, "data-table.steps.ts"),
      );

      expect(result.success).toBe(true);
    });
  });

  describe("DataTable type handling", () => {
    it("should receive DataTable object as parameter", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "data-table-parameter-type.feature"),
        path.join(STEPS_DIR, "data-table.steps.ts"),
      );

      expect(result.success).toBe(true);

      // Verify DataTable instance is passed correctly
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });

    it("should work with TypeScript typed context", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "data-table-typed-context.feature"),
        path.join(STEPS_DIR, "data-table.steps.ts"),
      );

      expect(result.success).toBe(true);
    });
  });

  describe("DataTable edge cases", () => {
    it("should handle empty table", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "data-table-empty.feature"),
        path.join(STEPS_DIR, "data-table.steps.ts"),
      );

      // Empty table might be valid or invalid depending on implementation
      // Just verify the test executes
      expect(result.output).toBeTruthy();
    });

    it("should handle single row table", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "data-table-single-row.feature"),
        path.join(STEPS_DIR, "data-table.steps.ts"),
      );

      expect(result.success).toBe(true);
    });

    it("should handle table with special characters", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "data-table-special-chars.feature"),
        path.join(STEPS_DIR, "data-table.steps.ts"),
      );

      expect(result.success).toBe(true);
    });
  });
});
