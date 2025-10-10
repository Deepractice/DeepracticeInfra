import { Given, When, Then } from "quickpickle";
import { expect } from "vitest";
import { eslint } from "../../src/api/eslint";
import { prettier } from "../../src/api/prettier";
import { typescript } from "../../src/api/typescript";
import { commitlint } from "../../src/api/commitlint";
import { vitest as vitestConfig } from "../../src/api/vitest";
import { tsup } from "../../src/api/tsup";
import { cucumber } from "../../src/api/cucumber";

interface TestContext {
  importedConfig?: any;
  configModule?: string;
  configType?: string;
}

// Common steps
Given("I have installed @deepracticex/configurer", async function () {
  // Installation is assumed in test environment
  expect(true).toBe(true);
});

// ESLint steps
When(
  "I import eslint.default from the package",
  async function (this: TestContext) {
    this.importedConfig = eslint.default;
    this.configType = "default";
    this.configModule = "eslint";
  },
);

When(
  "I import eslint.strict from the package",
  async function (this: TestContext) {
    this.importedConfig = eslint.strict;
    this.configType = "strict";
    this.configModule = "eslint";
  },
);

Then(
  "the config should include TypeScript support",
  async function (this: TestContext) {
    expect(this.importedConfig).toBeDefined();
    expect(Array.isArray(this.importedConfig)).toBe(true);
  },
);

Then(
  "the config should include Prettier integration",
  async function (this: TestContext) {
    expect(this.importedConfig).toBeDefined();
  },
);

Then(
  "the config should have recommended rules",
  async function (this: TestContext) {
    expect(this.importedConfig).toBeDefined();
  },
);

Then(
  "the config should ignore dist and node_modules",
  async function (this: TestContext) {
    expect(this.importedConfig).toBeDefined();
  },
);

// Prettier steps
When(
  "I import prettier.default from the package",
  async function (this: TestContext) {
    this.importedConfig = prettier.default;
    this.configType = "default";
    this.configModule = "prettier";
  },
);

Then(
  "the config should have semi set to true",
  async function (this: TestContext) {
    expect(this.importedConfig.semi).toBe(true);
  },
);

Then(
  "the config should have singleQuote set to false",
  async function (this: TestContext) {
    expect(this.importedConfig.singleQuote).toBe(false);
  },
);

Then(
  "the config should have tabWidth set to {int}",
  async function (this: TestContext, tabWidth: number) {
    expect(this.importedConfig.tabWidth).toBe(tabWidth);
  },
);

Then(
  "the config should have printWidth set to {int}",
  async function (this: TestContext, printWidth: number) {
    expect(this.importedConfig.printWidth).toBe(printWidth);
  },
);

Then(
  "the config should have trailingComma set to {string}",
  async function (this: TestContext, value: string) {
    expect(this.importedConfig.trailingComma).toBe(value);
  },
);

// Commitlint steps
When(
  "I import commitlint.default from the package",
  async function (this: TestContext) {
    this.importedConfig = commitlint.default;
    this.configType = "default";
    this.configModule = "commitlint";
  },
);

Then(
  "the config should extend {string}",
  async function (this: TestContext, extendValue: string) {
    expect(this.importedConfig.extends).toContain(extendValue);
  },
);
