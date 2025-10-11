/**
 * Verification tests to confirm actual Cucumber execution
 * These tests verify that scenarios are actually running and step definitions are being called
 */
import { describe, it, expect } from "vitest";
import { runCucumberFeature } from "../../../src/core/runner";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURES_DIR = path.resolve(__dirname, "../fixtures");
const STEPS_DIR = path.join(FIXTURES_DIR, "steps");

describe("Cucumber Execution Verification", () => {
  describe("Scenario Outline execution", () => {
    it("should execute all 4 examples in scenario outline", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "scenario-outline-advanced.feature"),
        path.join(STEPS_DIR, "advanced.steps.ts"),
      );

      // Debug: log the result
      if (!result.success) {
        console.log("Output:", result.output);
        console.log("Error:", result.error);
      }

      expect(result.success).toBe(true);

      // Verify output contains evidence of all 4 examples being executed
      expect(result.output).toBeTruthy();

      // Cucumber should report scenarios passed (one per example row)
      // Expected: "4 scenarios (4 passed)"
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        const totalScenarios = parseInt(scenarioMatch[1]);
        const passedScenarios = parseInt(scenarioMatch[2]);

        expect(totalScenarios).toBe(4);
        expect(passedScenarios).toBe(4);
      }
    });
  });

  describe("Background execution", () => {
    it("should execute background before each of 3 scenarios", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "background-advanced.feature"),
        path.join(STEPS_DIR, "advanced.steps.ts"),
      );

      expect(result.success).toBe(true);

      // Verify 3 scenarios executed
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        const totalScenarios = parseInt(scenarioMatch[1]);
        const passedScenarios = parseInt(scenarioMatch[2]);

        expect(totalScenarios).toBe(3);
        expect(passedScenarios).toBe(3);
      }
    });
  });

  describe("Rule execution", () => {
    it("should execute 4 scenarios organized under 2 rules", () => {
      const result = runCucumberFeature(
        path.join(FIXTURES_DIR, "rules-advanced.feature"),
        path.join(STEPS_DIR, "advanced.steps.ts"),
      );

      expect(result.success).toBe(true);

      // Verify 4 scenarios executed (2 under each rule)
      const scenarioMatch = result.output?.match(
        /(\d+) scenarios?\s*\((\d+) passed\)/,
      );
      if (scenarioMatch) {
        const totalScenarios = parseInt(scenarioMatch[1]);
        const passedScenarios = parseInt(scenarioMatch[2]);

        expect(totalScenarios).toBe(4);
        expect(passedScenarios).toBe(4);
      }
    });
  });

  describe("Step execution counts", () => {
    it("should execute correct number of steps per feature", () => {
      // Scenario Outline: 4 examples × 3 steps = 12 steps
      const outlineResult = runCucumberFeature(
        path.join(FIXTURES_DIR, "scenario-outline-advanced.feature"),
        path.join(STEPS_DIR, "advanced.steps.ts"),
      );

      expect(outlineResult.success).toBe(true);

      const outlineStepMatch = outlineResult.output?.match(
        /(\d+) steps?\s*\((\d+) passed\)/,
      );
      if (outlineStepMatch) {
        const totalSteps = parseInt(outlineStepMatch[1]);
        expect(totalSteps).toBe(12); // 4 examples × 3 steps each
      }

      // Background: 3 scenarios × (2 background + 2 scenario) = 12 steps
      const backgroundResult = runCucumberFeature(
        path.join(FIXTURES_DIR, "background-advanced.feature"),
        path.join(STEPS_DIR, "advanced.steps.ts"),
      );

      expect(backgroundResult.success).toBe(true);

      const backgroundStepMatch = backgroundResult.output?.match(
        /(\d+) steps?\s*\((\d+) passed\)/,
      );
      if (backgroundStepMatch) {
        const totalSteps = parseInt(backgroundStepMatch[1]);
        expect(totalSteps).toBe(12); // 3 scenarios × (2 background + 2 scenario)
      }

      // Rules: 4 scenarios × (1 background + 2 scenario) = 12 steps
      const rulesResult = runCucumberFeature(
        path.join(FIXTURES_DIR, "rules-advanced.feature"),
        path.join(STEPS_DIR, "advanced.steps.ts"),
      );

      expect(rulesResult.success).toBe(true);

      const rulesStepMatch = rulesResult.output?.match(
        /(\d+) steps?\s*\((\d+) passed\)/,
      );
      if (rulesStepMatch) {
        const totalSteps = parseInt(rulesStepMatch[1]);
        expect(totalSteps).toBe(12); // 4 scenarios × (1 background + 2 scenario)
      }
    });
  });
});
