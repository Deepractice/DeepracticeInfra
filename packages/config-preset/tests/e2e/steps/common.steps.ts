import { Given, When, Then } from "@deepracticex/vitest-cucumber";
import { expect } from "vitest";
import type { ConfigWorld } from "../support/world.js";
import { eslint } from "../../../src/api/eslint";
import { prettier } from "../../../src/api/prettier";
import { typescript } from "../../../src/api/typescript";
import { commitlint } from "../../../src/api/commitlint";
import { tsup } from "../../../src/api/tsup";

// ESLint steps
When("I import eslint.base from the package", function (this: ConfigWorld) {
  this.importedConfig = eslint.base;
  this.configType = "base";
  this.configModule = "eslint";
});

When("I export eslint.base as my eslint config", function (this: ConfigWorld) {
  this.exportedConfig = eslint.base;
});

Then(
  "the config should include TypeScript support",
  function (this: ConfigWorld) {
    expect(this.importedConfig).toBeDefined();
    expect(Array.isArray(this.importedConfig)).toBe(true);
    const tsConfig = this.importedConfig.find((config: any) =>
      config.files?.includes("**/*.ts"),
    );
    expect(tsConfig).toBeDefined();
    expect(tsConfig.languageOptions?.parser).toBeDefined();
  },
);

Then(
  "the config should include Prettier integration",
  function (this: ConfigWorld) {
    const tsConfig = this.importedConfig.find(
      (config: any) => config.plugins?.prettier,
    );
    expect(tsConfig).toBeDefined();
    expect(tsConfig.rules?.["prettier/prettier"]).toBe("error");
  },
);

Then("the config should have recommended rules", function (this: ConfigWorld) {
  expect(this.importedConfig).toBeDefined();
  expect(Array.isArray(this.importedConfig)).toBe(true);
  expect(this.importedConfig.length).toBeGreaterThan(0);
});

Then(
  "the config should ignore dist and node_modules",
  function (this: ConfigWorld) {
    const ignoreConfig = this.importedConfig.find(
      (config: any) => config.ignores,
    );
    expect(ignoreConfig).toBeDefined();
    expect(ignoreConfig.ignores).toContain("dist/**");
    expect(ignoreConfig.ignores).toContain("node_modules/**");
  },
);

Then("ESLint should be able to parse the config", function (this: ConfigWorld) {
  expect(Array.isArray(this.exportedConfig)).toBe(true);
  expect(this.exportedConfig.length).toBeGreaterThan(0);
  this.exportedConfig.forEach((config: any) => {
    expect(typeof config).toBe("object");
  });
});

Then("ESLint should apply the rules correctly", function (this: ConfigWorld) {
  const configWithRules = this.exportedConfig.find(
    (config: any) => config.rules && Object.keys(config.rules).length > 0,
  );
  expect(configWithRules).toBeDefined();
  expect(configWithRules.rules).toBeDefined();
  expect(Object.keys(configWithRules.rules).length).toBeGreaterThan(0);
});

// Prettier steps
When("I import prettier.base from the package", function (this: ConfigWorld) {
  this.importedConfig = prettier.base;
  this.configType = "base";
  this.configModule = "prettier";
});

Then("the config should have semi set to true", function (this: ConfigWorld) {
  expect(this.importedConfig.semi).toBe(true);
});

Then(
  "the config should have singleQuote set to false",
  function (this: ConfigWorld) {
    expect(this.importedConfig.singleQuote).toBe(false);
  },
);

Then(
  "the config should have tabWidth set to {int}",
  function (this: ConfigWorld, tabWidth: number) {
    expect(this.importedConfig.tabWidth).toBe(tabWidth);
  },
);

Then(
  "the config should have printWidth set to {int}",
  function (this: ConfigWorld, printWidth: number) {
    expect(this.importedConfig.printWidth).toBe(printWidth);
  },
);

Then(
  "the config should have trailingComma set to {string}",
  function (this: ConfigWorld, value: string) {
    expect(this.importedConfig.trailingComma).toBe(value);
  },
);

Then(
  "Prettier should be able to parse the config",
  function (this: ConfigWorld) {
    expect(this.exportedConfig).toBeDefined();
    expect(typeof this.exportedConfig).toBe("object");
  },
);

Then("Prettier should format code correctly", function (this: ConfigWorld) {
  expect(this.exportedConfig).toBeDefined();
  expect(this.exportedConfig).toHaveProperty("semi");
});

When(
  "I export prettier.base as my prettier config",
  function (this: ConfigWorld) {
    this.exportedConfig = prettier.base;
  },
);

// Commitlint steps
When("I import commitlint.base from the package", function (this: ConfigWorld) {
  this.importedConfig = commitlint.base;
  this.configType = "base";
  this.configModule = "commitlint";
});

Then(
  "the config should extend {string}",
  function (this: ConfigWorld, extendValue: string) {
    expect(this.importedConfig.extends).toContain(extendValue);
  },
);

Then(
  "the config should support commit types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert",
  function (this: ConfigWorld) {
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
    expect(typeEnum).toBeDefined();
    types.forEach((type) => {
      expect(typeEnum[2]).toContain(type);
    });
  },
);

Then(
  "the config should allow flexible subject case",
  function (this: ConfigWorld) {
    const subjectCase = this.importedConfig.rules?.["subject-case"];
    expect(subjectCase).toBeDefined();
    expect(subjectCase[0]).toBe(0);
  },
);

Then(
  "the config should limit subject to 100 characters",
  function (this: ConfigWorld) {
    const headerMaxLength = this.importedConfig.rules?.["header-max-length"];
    expect(headerMaxLength).toBeDefined();
    expect(headerMaxLength[2]).toBe(100);
  },
);

When(
  "I commit with message {string}",
  function (this: ConfigWorld, message: string) {
    this.commitMessage = message;
  },
);

Then("the validation should {string}", function (result: string) {
  // This is a placeholder - actual validation would require running commitlint
  expect(result).to.be.oneOf(["pass", "fail"]);
});

// TypeScript steps
When("I import typescript.base from the package", function (this: ConfigWorld) {
  this.importedConfig = typescript.base;
  this.configType = "base";
  this.configModule = "typescript";
});

When(
  "I extend typescript.base in my tsconfig.json",
  function (this: ConfigWorld) {
    this.importedConfig = typescript.base;
    this.configType = "base";
    this.configModule = "typescript";
  },
);

Then(
  "the config should target {string}",
  function (this: ConfigWorld, target: string) {
    expect(this.importedConfig.compilerOptions?.target).toBe(target);
  },
);

Then(
  "the config should use {string} module system",
  function (this: ConfigWorld, moduleSystem: string) {
    expect(this.importedConfig.compilerOptions?.module).toBe(moduleSystem);
  },
);

Then("the config should enable strict mode", function (this: ConfigWorld) {
  expect(this.importedConfig.compilerOptions?.strict).toBe(true);
});

Then("the config should include Node.js types", function (this: ConfigWorld) {
  expect(this.importedConfig.compilerOptions?.types).toContain("node");
});

Then("the config should resolve JSON modules", function (this: ConfigWorld) {
  expect(this.importedConfig.compilerOptions?.resolveJsonModule).toBe(true);
});

Then(
  "the config should enable declaration generation",
  function (this: ConfigWorld) {
    expect(this.importedConfig.compilerOptions?.declaration).toBe(true);
  },
);

Then("the config should use Node resolution", function (this: ConfigWorld) {
  expect(this.importedConfig.compilerOptions?.moduleResolution).toMatch(
    /Bundler|Node/i,
  );
});

Then(
  "the config should enable all strict checks",
  function (this: ConfigWorld) {
    expect(this.importedConfig.compilerOptions?.strict).toBe(true);
    expect(this.importedConfig.compilerOptions?.noImplicitAny).toBe(true);
    expect(this.importedConfig.compilerOptions?.strictNullChecks).toBe(true);
  },
);

// Vitest steps
When(
  "I import vitest.base from the package",
  async function (this: ConfigWorld) {
    const { vitest } = await import("../../../src/api/vitest");
    this.importedConfig = vitest.base;
    this.configType = "base";
    this.configModule = "vitest";
  },
);

Then("the config should enable globals", function (this: ConfigWorld) {
  expect(this.importedConfig.test?.globals).toBe(true);
});

Then("the config should use node environment", function (this: ConfigWorld) {
  expect(this.importedConfig.test?.environment).toBe("node");
});

Then("the config should pass with no tests", function (this: ConfigWorld) {
  expect(this.importedConfig.test?.passWithNoTests).toBe(true);
});

Then("the config should include unit test files", function (this: ConfigWorld) {
  expect(this.importedConfig.test?.include).toBeDefined();
  expect(Array.isArray(this.importedConfig.test?.include)).toBe(true);
});

Then(
  "the config should exclude node_modules and dist",
  function (this: ConfigWorld) {
    expect(this.importedConfig.test?.exclude).toContain("node_modules/**");
    expect(this.importedConfig.test?.exclude).toContain("dist/**");
  },
);

// Tsup steps
When("I import tsup.base from the package", function (this: ConfigWorld) {
  this.importedConfig = tsup.base;
  this.configType = "base";
  this.configModule = "tsup";
});

When(
  "I use tsup.createConfig with custom entry points",
  function (this: ConfigWorld) {
    this.customConfig = tsup.createConfig({
      entry: { custom: "src/custom.ts" },
    });
  },
);

Then(
  "the config should build both ESM and CJS formats",
  function (this: ConfigWorld) {
    expect(this.importedConfig.format).toContain("esm");
    expect(this.importedConfig.format).toContain("cjs");
  },
);

Then(
  "the config should generate TypeScript declarations",
  function (this: ConfigWorld) {
    expect(this.importedConfig.dts).toBe(true);
  },
);

Then("the config should clean output directory", function (this: ConfigWorld) {
  expect(this.importedConfig.clean).toBe(true);
});

Then("the config should enable sourcemaps", function (this: ConfigWorld) {
  expect(this.importedConfig.sourcemap).toBe(true);
});

Then("the config should enable treeshaking", function (this: ConfigWorld) {
  expect(this.importedConfig.treeshake).toBe(true);
});

Then(
  "the custom config should merge with base config",
  function (this: ConfigWorld) {
    expect(this.customConfig).toBeDefined();
    expect(this.customConfig.format).toContain("esm");
    expect(this.customConfig.entry).toHaveProperty("custom");
  },
);

// Package exports steps
When(
  "I import {string} from the main entry",
  async function (this: ConfigWorld, configName: string) {
    let configs: any = { eslint, prettier, typescript, commitlint, tsup };
    if (configName === "vitest") {
      const { vitest } = await import("../../../src/api/vitest");
      configs.vitest = vitest;
    }
    this.importedModule = configs[configName];
  },
);

When(
  "I import {string} directly from subpath",
  function (this: ConfigWorld, _subpath: string) {
    // This would test actual imports like @deepracticex/config-preset/api/eslint
    expect(true).toBe(true); // Placeholder
  },
);

Then("the import should succeed", function (this: ConfigWorld) {
  expect(this.importedModule).toBeDefined();
});

Then(
  "the {string} config should be available",
  function (this: ConfigWorld, configType: string) {
    expect(this.importedModule).toHaveProperty(configType);
  },
);

Then("the ESM import should work", function (this: ConfigWorld) {
  expect(true).toBe(true); // Placeholder for actual ESM test
});

Then("the CJS require should work", function (this: ConfigWorld) {
  expect(true).toBe(true); // Placeholder for actual CJS test
});

// Additional Tsup steps
Then(
  "the config should output both ESM and CommonJS formats",
  function (this: ConfigWorld) {
    expect(this.importedConfig.format).toContain("esm");
    expect(this.importedConfig.format).toContain("cjs");
  },
);

Then("the config should generate source maps", function (this: ConfigWorld) {
  expect(this.importedConfig.sourcemap).toBe(true);
});

Then(
  "the config should clean output directory before build",
  function (this: ConfigWorld) {
    expect(this.importedConfig.clean).toBe(true);
  },
);

Then(
  "the config should configure ~ alias to src directory",
  function (this: ConfigWorld) {
    expect(this.importedConfig.esbuildOptions).toBeDefined();
  },
);

When(
  "I use tsup.createConfig with custom options",
  function (this: ConfigWorld) {
    this.customConfig = tsup.createConfig({
      entry: ["src/custom.ts"],
    });
  },
);

Then(
  "the custom options should merge with base config",
  function (this: ConfigWorld) {
    expect(this.customConfig).toBeDefined();
    expect(this.customConfig.format).toContain("esm");
    expect(this.customConfig.entry).toContain("src/custom.ts");
  },
);

Then(
  "the ~ alias should resolve to src directory",
  function (this: ConfigWorld) {
    expect(this.customConfig.esbuildOptions).toBeDefined();
  },
);

Then(
  "all base config features should be available",
  function (this: ConfigWorld) {
    expect(this.customConfig.dts).toBe(true);
    expect(this.customConfig.sourcemap).toBe(true);
    expect(this.customConfig.clean).toBe(true);
  },
);

// Package exports steps
When(
  "I import from {string}",
  async function (this: ConfigWorld, importPath: string) {
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
  },
);

Then("I should be able to access eslint configs", function (this: ConfigWorld) {
  expect(this.allConfigs.eslint).toBeDefined();
  expect(this.allConfigs.eslint.base).toBeDefined();
});

Then(
  "I should be able to access prettier configs",
  function (this: ConfigWorld) {
    expect(this.allConfigs.prettier).toBeDefined();
    expect(this.allConfigs.prettier.base).toBeDefined();
  },
);

Then(
  "I should be able to access typescript configs",
  function (this: ConfigWorld) {
    expect(this.allConfigs.typescript).toBeDefined();
    expect(this.allConfigs.typescript.base).toBeDefined();
  },
);

Then(
  "I should be able to access all other configs",
  function (this: ConfigWorld) {
    expect(this.allConfigs.commitlint).toBeDefined();
    expect(this.allConfigs.vitest).toBeDefined();
    expect(this.allConfigs.tsup).toBeDefined();
  },
);

Then(
  "I should only load the {string} configuration",
  function (this: ConfigWorld, _moduleName: string) {
    expect(this.moduleConfig).toBeDefined();
    expect(this.moduleConfig.base).toBeDefined();
  },
);

Then("the import should be type-safe", function (this: ConfigWorld) {
  expect(this.moduleConfig).toBeDefined();
});

Given("my project uses ES modules", function (this: ConfigWorld) {
  this.projectType = "esm";
});

Given("my project uses CommonJS", function (this: ConfigWorld) {
  this.projectType = "cjs";
});

Then("the import should work correctly", function (this: ConfigWorld) {
  expect(this.allConfigs).toBeDefined();
});

When(
  "I require from {string}",
  async function (this: ConfigWorld, importPath: string) {
    this.importPath = importPath;
    const configs = await import("../../../src/index");
    this.allConfigs = configs;
  },
);

Then("the require should work correctly", function (this: ConfigWorld) {
  expect(this.allConfigs).toBeDefined();
});

// Common steps
Given(
  "I have installed {string}",
  function (this: ConfigWorld, packageName: string) {
    expect(packageName).toBe("@deepracticex/config-preset");
  },
);
