/**
 * E2E tests for DocString support
 * Tests scenarios from features/plugin-step-definitions.feature lines 105-127
 */
import { describe, it, expect } from "vitest";
import { runCucumberFeature } from "../../../src/core/runner";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURES_DIR = path.resolve(__dirname, "../fixtures");
const STEPS_DIR = path.join(FIXTURES_DIR, "steps");

describe("DocString Support", () => {
  describe("DocString as additional parameter", () => {
    it("should pass DocString as last parameter to step definition", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "doc-string-basic.feature"),
        path.join(STEPS_DIR, "doc-string.steps.ts"),
      );

      if (!result.success) {
        console.log("Output:", result.output);
        console.log("Error:", result.error);
      }

      expect(result.success).toBe(true);

      // Verify scenario with DocString executed
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        const passedScenarios = parseInt(scenarioMatch[2]);
        expect(passedScenarios).toBeGreaterThan(0);
      }
    });

    it("should work with other parameters before DocString", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "doc-string-with-params.feature"),
        path.join(STEPS_DIR, "doc-string.steps.ts"),
      );

      expect(result.success).toBe(true);

      // Verify step received both string parameter and DocString
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });

    it("should work with multiple parameters and DocString", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "doc-string-multiple-params.feature"),
        path.join(STEPS_DIR, "doc-string.steps.ts"),
      );

      expect(result.success).toBe(true);
    });
  });

  describe("Multi-line content preservation", () => {
    it("should preserve line breaks in DocString", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "doc-string-multiline.feature"),
        path.join(STEPS_DIR, "doc-string.steps.ts"),
      );

      if (!result.success) {
        console.log("Output:", result.output);
        console.log("Error:", result.error);
      }

      expect(result.success).toBe(true);

      // Verify multi-line content was preserved
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });

    it("should preserve indentation in DocString", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "doc-string-indentation.feature"),
        path.join(STEPS_DIR, "doc-string.steps.ts"),
      );

      expect(result.success).toBe(true);

      // Verify indented content (like code blocks) was preserved
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });

    it("should preserve empty lines in DocString", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "doc-string-empty-lines.feature"),
        path.join(STEPS_DIR, "doc-string.steps.ts"),
      );

      expect(result.success).toBe(true);
    });
  });

  describe("Content type handling", () => {
    it("should support JSON content type", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "doc-string-json.feature"),
        path.join(STEPS_DIR, "doc-string.steps.ts"),
      );

      if (!result.success) {
        console.log("Output:", result.output);
        console.log("Error:", result.error);
      }

      expect(result.success).toBe(true);

      // Verify JSON content was parsed correctly
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });

    it("should support XML content type", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "doc-string-xml.feature"),
        path.join(STEPS_DIR, "doc-string.steps.ts"),
      );

      expect(result.success).toBe(true);

      // Verify XML content was handled
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });

    it("should support Markdown content type", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "doc-string-markdown.feature"),
        path.join(STEPS_DIR, "doc-string.steps.ts"),
      );

      expect(result.success).toBe(true);
    });

    it("should support plain text (no content type)", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "doc-string-plain.feature"),
        path.join(STEPS_DIR, "doc-string.steps.ts"),
      );

      expect(result.success).toBe(true);
    });
  });

  describe("DocString edge cases", () => {
    it("should handle DocString with special characters", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "doc-string-special-chars.feature"),
        path.join(STEPS_DIR, "doc-string.steps.ts"),
      );

      expect(result.success).toBe(true);

      // Verify special characters like quotes, backslashes preserved
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });

    it("should handle empty DocString", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "doc-string-empty.feature"),
        path.join(STEPS_DIR, "doc-string.steps.ts"),
      );

      expect(result.success).toBe(true);
    });

    it("should handle DocString with only whitespace", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "doc-string-whitespace.feature"),
        path.join(STEPS_DIR, "doc-string.steps.ts"),
      );

      expect(result.success).toBe(true);
    });

    it("should handle very long DocString", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "doc-string-long.feature"),
        path.join(STEPS_DIR, "doc-string.steps.ts"),
      );

      expect(result.success).toBe(true);
    });
  });

  describe("DocString use cases", () => {
    it("should support JSON configuration in DocString", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "doc-string-json-config.feature"),
        path.join(STEPS_DIR, "doc-string.steps.ts"),
      );

      expect(result.success).toBe(true);

      // Verify JSON was used as configuration
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });

    it("should support code snippets in DocString", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "doc-string-code.feature"),
        path.join(STEPS_DIR, "doc-string.steps.ts"),
      );

      expect(result.success).toBe(true);
    });

    it("should support SQL queries in DocString", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "doc-string-sql.feature"),
        path.join(STEPS_DIR, "doc-string.steps.ts"),
      );

      expect(result.success).toBe(true);
    });

    it("should support HTML content in DocString", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "doc-string-html.feature"),
        path.join(STEPS_DIR, "doc-string.steps.ts"),
      );

      expect(result.success).toBe(true);
    });
  });
});
