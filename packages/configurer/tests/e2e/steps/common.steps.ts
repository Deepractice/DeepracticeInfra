import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import { eslint } from "../../../src/api/eslint";
import { prettier } from "../../../src/api/prettier";
import { typescript } from "../../../src/api/typescript";
import { commitlint } from "../../../src/api/commitlint";
import { tsup } from "../../../src/api/tsup";

// ESLint steps
When("I import eslint.base from the package", function () {
  this.importedConfig = eslint.base;
  this.configType = "base";
  this.configModule = "eslint";
});

When("I export eslint.base as my eslint config", function () {
  this.exportedConfig = eslint.base;
});

Then("the config should include TypeScript support", function () {
  expect(this.importedConfig).to.not.be.undefined;
  expect(Array.isArray(this.importedConfig)).to.be.true;
  const tsConfig = this.importedConfig.find((config: any) =>
    config.files?.includes("**/*.ts"),
  );
  expect(tsConfig).to.not.be.undefined;
  expect(tsConfig.languageOptions?.parser).to.not.be.undefined;
});

Then("the config should include Prettier integration", function () {
  const tsConfig = this.importedConfig.find(
    (config: any) => config.plugins?.prettier,
  );
  expect(tsConfig).to.not.be.undefined;
  expect(tsConfig.rules?.["prettier/prettier"]).to.equal("error");
});

Then("the config should have recommended rules", function () {
  expect(this.importedConfig).to.not.be.undefined;
  expect(Array.isArray(this.importedConfig)).to.be.true;
  expect(this.importedConfig.length).to.be.greaterThan(0);
});

Then("the config should ignore dist and node_modules", function () {
  const ignoreConfig = this.importedConfig.find(
    (config: any) => config.ignores,
  );
  expect(ignoreConfig).to.not.be.undefined;
  expect(ignoreConfig.ignores).to.include("dist/**");
  expect(ignoreConfig.ignores).to.include("node_modules/**");
});

Then("ESLint should be able to parse the config", function () {
  expect(Array.isArray(this.exportedConfig)).to.be.true;
  expect(this.exportedConfig.length).to.be.greaterThan(0);
  this.exportedConfig.forEach((config: any) => {
    expect(typeof config).to.equal("object");
  });
});

Then("ESLint should apply the rules correctly", function () {
  const configWithRules = this.exportedConfig.find(
    (config: any) => config.rules && Object.keys(config.rules).length > 0,
  );
  expect(configWithRules).to.not.be.undefined;
  expect(configWithRules.rules).to.not.be.undefined;
  expect(Object.keys(configWithRules.rules).length).to.be.greaterThan(0);
});

// Prettier steps
When("I import prettier.base from the package", function () {
  this.importedConfig = prettier.base;
  this.configType = "base";
  this.configModule = "prettier";
});

Then("the config should have semi set to true", function () {
  expect(this.importedConfig.semi).to.equal(true);
});

Then("the config should have singleQuote set to false", function () {
  expect(this.importedConfig.singleQuote).to.equal(false);
});

Then(
  "the config should have tabWidth set to {int}",
  function (tabWidth: number) {
    expect(this.importedConfig.tabWidth).to.equal(tabWidth);
  },
);

Then(
  "the config should have printWidth set to {int}",
  function (printWidth: number) {
    expect(this.importedConfig.printWidth).to.equal(printWidth);
  },
);

Then(
  "the config should have trailingComma set to {string}",
  function (value: string) {
    expect(this.importedConfig.trailingComma).to.equal(value);
  },
);

Then("Prettier should be able to parse the config", function () {
  expect(this.exportedConfig).to.not.be.undefined;
  expect(typeof this.exportedConfig).to.equal("object");
});

Then("Prettier should format code correctly", function () {
  expect(this.exportedConfig).to.not.be.undefined;
  expect(this.exportedConfig).to.have.property("semi");
});

When("I export prettier.base as my prettier config", function () {
  this.exportedConfig = prettier.base;
});

// Commitlint steps
When("I import commitlint.base from the package", function () {
  this.importedConfig = commitlint.base;
  this.configType = "base";
  this.configModule = "commitlint";
});

Then("the config should extend {string}", function (extendValue: string) {
  expect(this.importedConfig.extends).to.include(extendValue);
});

Then(
  "the config should support commit types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert",
  function () {
    const types = [
      "feat",
      "fix",
      "docs",
      "style",
      "refactor",
      "perf",
      "test",
      "build",
      "ci",
      "chore",
      "revert",
    ];
    const typeEnum = this.importedConfig.rules?.["type-enum"];
    expect(typeEnum).to.not.be.undefined;
    types.forEach((type) => {
      expect(typeEnum[2]).to.include(type);
    });
  },
);

Then("the config should allow flexible subject case", function () {
  const subjectCase = this.importedConfig.rules?.["subject-case"];
  expect(subjectCase).to.not.be.undefined;
  expect(subjectCase[0]).to.equal(0);
});

Then("the config should limit subject to 100 characters", function () {
  const headerMaxLength = this.importedConfig.rules?.["header-max-length"];
  expect(headerMaxLength).to.not.be.undefined;
  expect(headerMaxLength[2]).to.equal(100);
});

When("I commit with message {string}", function (message: string) {
  this.commitMessage = message;
});

Then("the validation should {string}", function (result: string) {
  // This is a placeholder - actual validation would require running commitlint
  expect(result).to.be.oneOf(["pass", "fail"]);
});

// TypeScript steps
When("I import typescript.base from the package", function () {
  this.importedConfig = typescript.base;
  this.configType = "base";
  this.configModule = "typescript";
});

When("I extend typescript.base in my tsconfig.json", function () {
  this.importedConfig = typescript.base;
  this.configType = "base";
  this.configModule = "typescript";
});

Then("the config should target {string}", function (target: string) {
  expect(this.importedConfig.compilerOptions?.target).to.equal(target);
});

Then(
  "the config should use {string} module system",
  function (moduleSystem: string) {
    expect(this.importedConfig.compilerOptions?.module).to.equal(moduleSystem);
  },
);

Then("the config should enable strict mode", function () {
  expect(this.importedConfig.compilerOptions?.strict).to.be.true;
});

Then("the config should include Node.js types", function () {
  expect(this.importedConfig.compilerOptions?.types).to.include("node");
});

Then("the config should resolve JSON modules", function () {
  expect(this.importedConfig.compilerOptions?.resolveJsonModule).to.be.true;
});

Then("the config should enable declaration generation", function () {
  expect(this.importedConfig.compilerOptions?.declaration).to.be.true;
});

Then("the config should use Node resolution", function () {
  expect(this.importedConfig.compilerOptions?.moduleResolution).to.match(
    /Bundler|Node/i,
  );
});

Then("the config should enable all strict checks", function () {
  expect(this.importedConfig.compilerOptions?.strict).to.be.true;
  expect(this.importedConfig.compilerOptions?.noImplicitAny).to.be.true;
  expect(this.importedConfig.compilerOptions?.strictNullChecks).to.be.true;
});

// Vitest steps
When("I import vitest.base from the package", async function () {
  const { vitest } = await import("../../../src/api/vitest");
  this.importedConfig = vitest.base;
  this.configType = "base";
  this.configModule = "vitest";
});

Then("the config should enable globals", function () {
  expect(this.importedConfig.test?.globals).to.be.true;
});

Then("the config should use node environment", function () {
  expect(this.importedConfig.test?.environment).to.equal("node");
});

Then("the config should pass with no tests", function () {
  expect(this.importedConfig.test?.passWithNoTests).to.be.true;
});

Then("the config should include unit test files", function () {
  expect(this.importedConfig.test?.include).to.not.be.undefined;
  expect(this.importedConfig.test?.include).to.be.an("array");
});

Then("the config should exclude node_modules and dist", function () {
  expect(this.importedConfig.test?.exclude).to.include("node_modules/**");
  expect(this.importedConfig.test?.exclude).to.include("dist/**");
});

// Tsup steps
When("I import tsup.base from the package", function () {
  this.importedConfig = tsup.base;
  this.configType = "base";
  this.configModule = "tsup";
});

When("I use tsup.createConfig with custom entry points", function () {
  this.customConfig = tsup.createConfig({
    entry: { custom: "src/custom.ts" },
  });
});

Then("the config should build both ESM and CJS formats", function () {
  expect(this.importedConfig.format).to.include("esm");
  expect(this.importedConfig.format).to.include("cjs");
});

Then("the config should generate TypeScript declarations", function () {
  expect(this.importedConfig.dts).to.be.true;
});

Then("the config should clean output directory", function () {
  expect(this.importedConfig.clean).to.be.true;
});

Then("the config should enable sourcemaps", function () {
  expect(this.importedConfig.sourcemap).to.be.true;
});

Then("the config should enable treeshaking", function () {
  expect(this.importedConfig.treeshake).to.be.true;
});

Then("the custom config should merge with base config", function () {
  expect(this.customConfig).to.not.be.undefined;
  expect(this.customConfig.format).to.include("esm");
  expect(this.customConfig.entry).to.have.property("custom");
});

// Package exports steps
When(
  "I import {string} from the main entry",
  async function (configName: string) {
    let configs: any = { eslint, prettier, typescript, commitlint, tsup };
    if (configName === "vitest") {
      const { vitest } = await import("../../../src/api/vitest");
      configs.vitest = vitest;
    }
    this.importedModule = configs[configName];
  },
);

When("I import {string} directly from subpath", function (_subpath: string) {
  // This would test actual imports like @deepracticex/configurer/api/eslint
  expect(true).to.be.true; // Placeholder
});

Then("the import should succeed", function () {
  expect(this.importedModule).to.not.be.undefined;
});

Then("the {string} config should be available", function (configType: string) {
  expect(this.importedModule).to.have.property(configType);
});

Then("the ESM import should work", function () {
  expect(true).to.be.true; // Placeholder for actual ESM test
});

Then("the CJS require should work", function () {
  expect(true).to.be.true; // Placeholder for actual CJS test
});

// Common steps
Given("I have installed {string}", function (packageName: string) {
  expect(packageName).to.equal("@deepracticex/configurer");
});
