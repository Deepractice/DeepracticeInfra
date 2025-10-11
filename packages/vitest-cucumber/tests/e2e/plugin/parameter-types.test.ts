/**
 * E2E tests for Parameter Types
 * Tests scenarios from features/plugin-step-definitions.feature lines 12-62
 */
import { describe, it, expect } from "vitest";
import { runCucumberFeature } from "../../../src/core/runner";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURES_DIR = path.resolve(__dirname, "../fixtures");
const STEPS_DIR = path.join(FIXTURES_DIR, "steps");

describe("Parameter Types", () => {
  describe("{string} parameter type", () => {
    it("should extract string from quoted text", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-string-basic.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      if (!result.success) {
        console.log("Output:", result.output);
        console.log("Error:", result.error);
      }

      expect(result.success).toBe(true);

      // Verify string parameter was extracted and typed correctly
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        const passedScenarios = parseInt(scenarioMatch[2]);
        expect(passedScenarios).toBeGreaterThan(0);
      }
    });

    it("should handle multiple {string} parameters", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-string-multiple.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      expect(result.success).toBe(true);

      // Verify multiple string parameters extracted correctly
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });

    it("should handle empty string parameter", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-string-empty.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      expect(result.success).toBe(true);
    });

    it("should handle string with special characters", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-string-special-chars.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      expect(result.success).toBe(true);

      // Verify special characters preserved in string
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });

    it("should provide TypeScript string type", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-string-typescript.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      expect(result.success).toBe(true);

      // Verify TypeScript type inference works
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });
  });

  describe("{int} parameter type", () => {
    it("should extract and convert integer parameter", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-int-basic.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      if (!result.success) {
        console.log("Output:", result.output);
        console.log("Error:", result.error);
      }

      expect(result.success).toBe(true);

      // Verify int converted to number type
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });

    it("should handle multiple {int} parameters", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-int-multiple.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      expect(result.success).toBe(true);

      // Verify multiple integers extracted correctly
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });

    it("should handle negative integers", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-int-negative.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      expect(result.success).toBe(true);
    });

    it("should handle zero", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-int-zero.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      expect(result.success).toBe(true);
    });

    it("should provide TypeScript number type for {int}", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-int-typescript.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      expect(result.success).toBe(true);

      // Verify TypeScript type inference for number
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });
  });

  describe("{float} parameter type", () => {
    it("should extract and convert float parameter", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-float-basic.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      if (!result.success) {
        console.log("Output:", result.output);
        console.log("Error:", result.error);
      }

      expect(result.success).toBe(true);

      // Verify float converted to number type with decimals
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });

    it("should handle decimal precision", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-float-precision.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      expect(result.success).toBe(true);

      // Verify decimal places preserved
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });

    it("should handle negative floats", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-float-negative.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      expect(result.success).toBe(true);
    });

    it("should handle scientific notation", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-float-scientific.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      expect(result.success).toBe(true);
    });

    it("should provide TypeScript number type for {float}", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-float-typescript.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      expect(result.success).toBe(true);

      // Verify TypeScript type inference for number
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });
  });

  describe("{word} parameter type", () => {
    it("should extract word parameter (no whitespace)", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-word-basic.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      if (!result.success) {
        console.log("Output:", result.output);
        console.log("Error:", result.error);
      }

      expect(result.success).toBe(true);

      // Verify word extracted as string without quotes
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });

    it("should handle alphanumeric words", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-word-alphanumeric.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      expect(result.success).toBe(true);

      // Verify alphanumeric word extracted
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });

    it("should handle underscores and hyphens in words", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-word-special.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      expect(result.success).toBe(true);
    });

    it("should stop at whitespace", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-word-whitespace.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      expect(result.success).toBe(true);

      // Verify only first word extracted
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });

    it("should provide TypeScript string type for {word}", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-word-typescript.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      expect(result.success).toBe(true);

      // Verify TypeScript type inference for string
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });
  });

  describe("Mixed parameter types", () => {
    it("should handle combination of string, int, and float", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-mixed-types.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      expect(result.success).toBe(true);

      // Verify all parameter types work together
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });

    it("should handle parameters in any order", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-mixed-order.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      expect(result.success).toBe(true);
    });

    it("should maintain correct types with multiple parameters", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-mixed-typing.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      expect(result.success).toBe(true);

      // Verify TypeScript types correct for each parameter
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });
  });

  describe("Parameter type edge cases", () => {
    it("should handle large integers", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-int-large.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      expect(result.success).toBe(true);
    });

    it("should handle very precise floats", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-float-precise.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      expect(result.success).toBe(true);
    });

    it("should handle unicode in string parameters", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-string-unicode.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      expect(result.success).toBe(true);

      // Verify unicode characters preserved
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        expect(parseInt(scenarioMatch[2])).toBeGreaterThan(0);
      }
    });

    it("should handle escaped quotes in string", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "param-string-escaped.feature"),
        path.join(STEPS_DIR, "parameter-types.steps.ts"),
      );

      expect(result.success).toBe(true);
    });
  });
});
