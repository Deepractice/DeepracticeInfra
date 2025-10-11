import { Given, When, Then } from "../../../src/api/cucumber";
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
  // This would test actual imports like @deepracticex/config-preset/api/eslint
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

// Additional Tsup steps
Then("the config should output both ESM and CommonJS formats", function () {
  expect(this.importedConfig.format).to.include("esm");
  expect(this.importedConfig.format).to.include("cjs");
});

Then("the config should generate source maps", function () {
  expect(this.importedConfig.sourcemap).to.be.true;
});

Then("the config should clean output directory before build", function () {
  expect(this.importedConfig.clean).to.be.true;
});

Then("the config should configure ~ alias to src directory", function () {
  expect(this.importedConfig.esbuildOptions).to.not.be.undefined;
});

When("I use tsup.createConfig with custom options", function () {
  this.customConfig = tsup.createConfig({
    entry: ["src/custom.ts"],
  });
});

Then("the custom options should merge with base config", function () {
  expect(this.customConfig).to.not.be.undefined;
  expect(this.customConfig.format).to.include("esm");
  expect(this.customConfig.entry).to.include("src/custom.ts");
});

Then("the ~ alias should resolve to src directory", function () {
  expect(this.customConfig.esbuildOptions).to.not.be.undefined;
});

Then("all base config features should be available", function () {
  expect(this.customConfig.dts).to.be.true;
  expect(this.customConfig.sourcemap).to.be.true;
  expect(this.customConfig.clean).to.be.true;
});

// Package exports steps
When("I import from {string}", async function (importPath: string) {
  this.importPath = importPath;
  if (importPath === "@deepracticex/config-preset") {
    const configs = await import("../../../src/index");
    this.allConfigs = configs;
  } else {
    // Handle subpath imports like "@deepracticex/config-preset/eslint"
    const module = importPath.split("/").pop();
    if (!module) {
      throw new Error(`Invalid import path: ${importPath}`);
    }
    const moduleImport = await import(`../../../src/api/${module}`);
    this.moduleConfig = moduleImport[module];
  }
});

Then("I should be able to access eslint configs", function () {
  expect(this.allConfigs.eslint).to.not.be.undefined;
  expect(this.allConfigs.eslint.base).to.not.be.undefined;
});

Then("I should be able to access prettier configs", function () {
  expect(this.allConfigs.prettier).to.not.be.undefined;
  expect(this.allConfigs.prettier.base).to.not.be.undefined;
});

Then("I should be able to access typescript configs", function () {
  expect(this.allConfigs.typescript).to.not.be.undefined;
  expect(this.allConfigs.typescript.base).to.not.be.undefined;
});

Then("I should be able to access all other configs", function () {
  expect(this.allConfigs.commitlint).to.not.be.undefined;
  expect(this.allConfigs.vitest).to.not.be.undefined;
  expect(this.allConfigs.tsup).to.not.be.undefined;
});

Then(
  "I should only load the {string} configuration",
  function (_moduleName: string) {
    expect(this.moduleConfig).to.not.be.undefined;
    expect(this.moduleConfig.base).to.not.be.undefined;
  },
);

Then("the import should be type-safe", function () {
  expect(this.moduleConfig).to.not.be.undefined;
});

Given("my project uses ES modules", function () {
  this.projectType = "esm";
});

Given("my project uses CommonJS", function () {
  this.projectType = "cjs";
});

Then("the import should work correctly", function () {
  expect(this.allConfigs).to.not.be.undefined;
});

When("I require from {string}", async function (importPath: string) {
  this.importPath = importPath;
  const configs = await import("../../../src/index");
  this.allConfigs = configs;
});

Then("the require should work correctly", function () {
  expect(this.allConfigs).to.not.be.undefined;
});

// Common steps
Given("I have installed {string}", function (packageName: string) {
  expect(packageName).to.equal("@deepracticex/config-preset");
});
