import { defineConfig } from "vitest/config";
import {
  vitestCucumber,
  type VitestCucumberPluginOptions,
} from "@deepracticex/vitest-cucumber-plugin";

/**
 * Vitest configuration presets for Deepractice projects
 */
export const vitest = {
  /**
   * Base configuration: Standard testing setup with Cucumber BDD support
   *
   * Includes:
   * - Unit tests: tests/unit/**\/*.test.ts, tests/unit/**\/*.spec.ts
   * - E2E tests: tests/e2e/**\/*.test.ts
   * - Cucumber BDD: **\/*.feature files with automatic step discovery
   * - Coverage reporting (v8 provider)
   *
   * Usage:
   * - Run all tests: pnpm test
   * - Run unit tests only: pnpm test tests/unit
   * - Run e2e tests only: pnpm test tests/e2e
   * - Run with coverage: pnpm test --coverage
   */
  base: defineConfig({
    plugins: [
      vitestCucumber({
        runtimeModule: "@deepracticex/vitest-cucumber",
      }),
    ],
    test: {
      globals: true,
      environment: "node",
      passWithNoTests: true,
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
        exclude: [
          "node_modules/**",
          "dist/**",
          "tests/**",
          "**/*.config.*",
          "**/*.d.ts",
        ],
      },
      include: [
        "tests/unit/**/*.test.ts",
        "tests/unit/**/*.spec.ts",
        "tests/e2e/**/*.test.ts",
        "**/*.feature",
      ],
      exclude: ["node_modules/**", "dist/**"],
      testTimeout: 30000, // Accommodate longer E2E tests
    },
  }),

  /**
   * Create a custom Vitest config with Cucumber support
   *
   * @param cucumberOptions - Custom options for vitest-cucumber plugin
   * @returns Vitest configuration with custom Cucumber settings
   *
   * @example
   * ```ts
   * // Custom step directory location
   * export default vitest.withCucumber({
   *   steps: "tests/e2e/custom-steps",
   * });
   * ```
   */
  withCucumber(
    cucumberOptions?: VitestCucumberPluginOptions,
  ): ReturnType<typeof defineConfig> {
    return defineConfig({
      plugins: [
        vitestCucumber({
          runtimeModule: "@deepracticex/vitest-cucumber",
          ...cucumberOptions,
        }),
      ],
      test: {
        globals: true,
        environment: "node",
        passWithNoTests: true,
        coverage: {
          provider: "v8",
          reporter: ["text", "json", "html"],
          exclude: [
            "node_modules/**",
            "dist/**",
            "tests/**",
            "**/*.config.*",
            "**/*.d.ts",
          ],
        },
        include: [
          "tests/unit/**/*.test.ts",
          "tests/unit/**/*.spec.ts",
          "tests/e2e/**/*.test.ts",
          "**/*.feature",
        ],
        exclude: ["node_modules/**", "dist/**"],
        testTimeout: 30000,
      },
    });
  },
};
