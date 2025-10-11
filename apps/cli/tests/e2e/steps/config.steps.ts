/**
 * Step definitions for configuration initialization scenarios
 */
import { Given, Then, DataTable } from "@deepracticex/testing-utils";
import { expect } from "chai";
import fs from "fs-extra";
import path from "node:path";
import type { InfraWorld } from "../support/world.js";

// Given steps for config scenarios

Given(
  "file {string} already exists",
  async function (this: InfraWorld, fileName: string) {
    const filePath = path.join(this.testDir!, fileName);
    await fs.ensureDir(path.dirname(filePath));

    // Create a simple existing file based on type
    if (fileName.endsWith(".json")) {
      await fs.writeJson(filePath, { existing: true }, { spaces: 2 });
    } else if (fileName === ".gitignore") {
      await fs.writeFile(filePath, "node_modules/\n");
    } else if (fileName === ".editorconfig") {
      await fs.writeFile(filePath, "[*]\nindent_style = space\n");
    } else {
      await fs.writeFile(filePath, "existing content");
    }
  },
);

// Then steps for config file validation

Then(
  "the following config files should exist:",
  async function (this: InfraWorld, dataTable: DataTable) {
    const rows = dataTable.raw().slice(1); // Skip header row

    for (const row of rows) {
      const [fileName, tool] = row;
      const filePath = path.join(this.testDir!, fileName!);
      const exists = await fs.pathExists(filePath);
      expect(exists, `Config file ${fileName} for ${tool} should exist`).to.be
        .true;
    }
  },
);

Then(
  "{string} should contain strict ESLint rules",
  async function (this: InfraWorld, fileName: string) {
    const filePath = path.join(this.testDir!, fileName);
    const content = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(content);

    // Check for strict ESLint configuration
    expect(json).to.have.property("extends");
    expect(json).to.have.property("rules");
    expect(json.rules).to.have.property("no-console", "error");
    expect(json.rules).to.have.property(
      "@typescript-eslint/no-explicit-any",
      "error",
    );
  },
);

Then(
  "{string} should contain strict formatting rules",
  async function (this: InfraWorld, fileName: string) {
    const filePath = path.join(this.testDir!, fileName);
    const content = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(content);

    // Check for strict formatting configuration
    expect(json).to.be.an("object");
    expect(json).to.have.property("trailingComma", "all");
  },
);

Then(
  "{string} should be updated",
  async function (this: InfraWorld, fileName: string) {
    const filePath = path.join(this.testDir!, fileName);
    const exists = await fs.pathExists(filePath);
    expect(exists, `File ${fileName} should exist after update`).to.be.true;

    // Check that file was recently modified (within last few seconds)
    const stats = await fs.stat(filePath);
    const now = Date.now();
    const modifiedTime = stats.mtimeMs;
    const timeDiff = now - modifiedTime;

    expect(timeDiff).to.be.lessThan(
      5000,
      `File ${fileName} should have been recently updated`,
    );
  },
);

Then(
  "file {string} should not exist",
  async function (this: InfraWorld, fileName: string) {
    const filePath = path.join(this.testDir!, fileName);
    const exists = await fs.pathExists(filePath);
    expect(exists, `File ${fileName} should not exist`).to.be.false;
  },
);

Then(
  "{string} should contain:",
  async function (this: InfraWorld, fileName: string, dataTable: DataTable) {
    const filePath = path.join(this.testDir!, fileName);
    const content = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(content);

    const rows = dataTable.raw().slice(1); // Skip header row

    for (const row of rows) {
      const [setting, value] = row;
      const settingPath = setting!.split(".");

      // Navigate to nested property
      let currentValue: unknown = json;
      for (const key of settingPath) {
        if (typeof currentValue === "object" && currentValue !== null) {
          currentValue = (currentValue as Record<string, unknown>)[key];
        }
      }

      // Check if the value matches (can be in extends array or direct value)
      if (Array.isArray(currentValue)) {
        expect(currentValue).to.include(
          value,
          `${fileName} should have ${setting} containing ${value}`,
        );
      } else if (typeof currentValue === "string") {
        expect(currentValue).to.include(
          value!,
          `${fileName} should have ${setting} = ${value}`,
        );
      } else {
        expect(currentValue).to.equal(
          value === "true" ? true : value === "false" ? false : value,
          `${fileName} should have ${setting} = ${value}`,
        );
      }
    }
  },
);

// Config list step definitions

Given(
  "the following config files exist:",
  async function (this: InfraWorld, dataTable: DataTable) {
    const rows = dataTable.raw().slice(1); // Skip header row

    for (const row of rows) {
      const [fileName] = row;
      const filePath = path.join(this.testDir!, fileName!);
      await fs.ensureDir(path.dirname(filePath));

      if (fileName!.endsWith(".json")) {
        await fs.writeJson(filePath, { test: true }, { spaces: 2 });
      } else if (fileName === ".editorconfig") {
        await fs.writeFile(filePath, "[*]\nindent_style = space\n");
      } else {
        await fs.writeFile(filePath, "test content");
      }
    }
  },
);

Given(
  "file {string} exists",
  async function (this: InfraWorld, fileName: string) {
    const filePath = path.join(this.testDir!, fileName);
    await fs.ensureDir(path.dirname(filePath));

    if (fileName.endsWith(".json")) {
      await fs.writeJson(filePath, { test: true }, { spaces: 2 });
    } else if (fileName === ".editorconfig") {
      await fs.writeFile(filePath, "[*]\nindent_style = space\n");
    } else {
      await fs.writeFile(filePath, "test content");
    }
  },
);

Given(
  "{string} extends {string}",
  async function (this: InfraWorld, fileName: string, extendsValue: string) {
    const filePath = path.join(this.testDir!, fileName);
    await fs.ensureDir(path.dirname(filePath));

    await fs.writeJson(
      filePath,
      {
        extends: extendsValue,
        rules: {},
      },
      { spaces: 2 },
    );
  },
);

Given(
  "{string} contains custom rules",
  async function (this: InfraWorld, fileName: string) {
    const filePath = path.join(this.testDir!, fileName);
    await fs.ensureDir(path.dirname(filePath));

    await fs.writeJson(
      filePath,
      {
        semi: false,
        singleQuote: true,
        customRule: "custom value",
      },
      { spaces: 2 },
    );
  },
);

Given(
  "all config files exist with valid configuration",
  async function (this: InfraWorld) {
    const configFiles = [
      {
        name: ".eslintrc.json",
        content: { extends: "@deepracticex/eslint-config", rules: {} },
      },
      {
        name: ".prettierrc.json",
        content: { semi: true, singleQuote: true },
      },
      {
        name: "tsconfig.json",
        content: { extends: "@deepracticex/typescript-config/base.json" },
      },
      { name: ".editorconfig", content: "[*]\nindent_style = space\n" },
    ];

    for (const config of configFiles) {
      const filePath = path.join(this.testDir!, config.name);
      await fs.ensureDir(path.dirname(filePath));

      if (config.name.endsWith(".json")) {
        await fs.writeJson(filePath, config.content, { spaces: 2 });
      } else {
        await fs.writeFile(filePath, config.content as string);
      }
    }
  },
);

Given(
  "{string} exists with valid configuration",
  async function (this: InfraWorld, fileName: string) {
    const filePath = path.join(this.testDir!, fileName);
    await fs.ensureDir(path.dirname(filePath));

    if (fileName === ".eslintrc.json") {
      await fs.writeJson(
        filePath,
        { extends: "@deepracticex/eslint-config", rules: {} },
        { spaces: 2 },
      );
    } else if (fileName === ".prettierrc.json") {
      await fs.writeJson(
        filePath,
        { semi: true, singleQuote: true },
        { spaces: 2 },
      );
    } else if (fileName === "tsconfig.json") {
      await fs.writeJson(
        filePath,
        { extends: "@deepracticex/typescript-config/base.json" },
        { spaces: 2 },
      );
    } else {
      await fs.writeFile(filePath, "valid content");
    }
  },
);

Given(
  "{string} has {string}",
  async function (this: InfraWorld, fileName: string, setting: string) {
    const filePath = path.join(this.testDir!, fileName);

    // Parse setting like "semi: true" or just "semi"
    const [key, value] = setting.split(": ").map((s) => s.trim());

    let config: Record<string, unknown> = {};
    if (await fs.pathExists(filePath)) {
      config = await fs.readJson(filePath);
    }

    // Set the value
    if (value) {
      config[key!] =
        value === "true" ? true : value === "false" ? false : value;
    } else {
      config[key!] = true;
    }

    await fs.writeJson(filePath, config, { spaces: 2 });
  },
);

Given(
  "{string} has invalid {string}",
  async function (this: InfraWorld, fileName: string, fieldName: string) {
    const filePath = path.join(this.testDir!, fileName);
    await fs.ensureDir(path.dirname(filePath));

    const config: Record<string, unknown> = {
      [fieldName]: "invalid value that will cause validation to fail",
    };

    await fs.writeJson(filePath, config, { spaces: 2 });
  },
);

Given(
  "{string} has references to non-existent packages",
  async function (this: InfraWorld, fileName: string) {
    const filePath = path.join(this.testDir!, fileName);
    await fs.ensureDir(path.dirname(filePath));

    await fs.writeJson(
      filePath,
      {
        extends: "@deepracticex/typescript-config/base.json",
        references: [
          { path: "./packages/non-existent-package-1" },
          { path: "./packages/non-existent-package-2" },
        ],
      },
      { spaces: 2 },
    );
  },
);

Given(
  "package {string} is not installed",
  async function (this: InfraWorld, packageName: string) {
    // This step is passive - we just don't install the package
    // The package will not exist in node_modules
    // We can add a marker to track expected missing packages
    if (!this.expectedMissingPackages) {
      this.expectedMissingPackages = [];
    }
    this.expectedMissingPackages.push(packageName);
  },
);

Given(
  "{string} has conflicting settings with Prettier",
  async function (this: InfraWorld, fileName: string) {
    const filePath = path.join(this.testDir!, fileName);
    await fs.ensureDir(path.dirname(filePath));

    // Create .eslintrc.json with settings that conflict with Prettier
    await fs.writeJson(
      filePath,
      {
        extends: ["eslint:recommended"],
        rules: {
          semi: "error",
          quotes: ["error", "double"],
          "max-len": ["error", { code: 80 }],
        },
      },
      { spaces: 2 },
    );

    // Create .prettierrc.json with conflicting settings
    const prettierPath = path.join(this.testDir!, ".prettierrc.json");
    await fs.writeJson(
      prettierPath,
      {
        semi: false,
        singleQuote: true,
        printWidth: 120,
      },
      { spaces: 2 },
    );
  },
);

Then(
  "I should see configuration files listed:",
  function (this: InfraWorld, dataTable: DataTable) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    const rows = dataTable.raw().slice(1); // Skip header row

    for (const row of rows) {
      const [file, tool, status] = row;
      expect(allOutput).to.include(file!, `Output should contain file ${file}`);
      if (tool) {
        expect(allOutput).to.include(
          tool,
          `Output should contain tool ${tool}`,
        );
      }
      if (status) {
        expect(allOutput).to.include(
          status,
          `Output should contain status ${status}`,
        );
      }
    }
  },
);

Then(
  "I should see {string} mapped to tool {string}",
  function (this: InfraWorld, fileName: string, toolName: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include(
      fileName,
      `Output should contain file ${fileName}`,
    );
    expect(allOutput).to.include(
      toolName,
      `Output should contain tool ${toolName}`,
    );
  },
);

Then(
  "I should see {string} marked as {string}",
  function (this: InfraWorld, fileName: string, status: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include(
      fileName,
      `Output should contain file ${fileName}`,
    );
    expect(allOutput).to.include(
      status,
      `Output should contain status ${status}`,
    );
  },
);

Then(
  "I should see missing configs:",
  function (this: InfraWorld, dataTable: DataTable) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    const rows = dataTable.raw().slice(1); // Skip header row

    for (const row of rows) {
      const [file, tool, status] = row;
      expect(allOutput).to.include(file!, `Output should mention ${file}`);
      if (tool) {
        expect(allOutput).to.include(
          tool,
          `Output should mention tool ${tool}`,
        );
      }
      if (status) {
        expect(allOutput).to.include(
          status,
          `Output should show status ${status}`,
        );
      }
    }
  },
);

// Config validate step definitions

Then(
  "I should see conflict details:",
  function (this: InfraWorld, dataTable: DataTable) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    const rows = dataTable.raw().slice(1); // Skip header row

    for (const row of rows) {
      const [setting, eslintValue, prettierValue] = row;
      expect(allOutput).to.include(
        setting!,
        `Output should contain setting ${setting}`,
      );
      if (eslintValue) {
        expect(allOutput).to.include(
          eslintValue,
          `Output should contain ESLint value ${eslintValue}`,
        );
      }
      if (prettierValue) {
        expect(allOutput).to.include(
          prettierValue,
          `Output should contain Prettier value ${prettierValue}`,
        );
      }
    }
  },
);

Then("I should see recommended settings", function (this: InfraWorld) {
  const allOutput = [...this.stdout, ...this.stderr].join("\n");
  expect(allOutput.length).to.be.greaterThan(
    0,
    "Output should contain recommended settings",
  );
  // Look for keywords that indicate recommendations
  const hasRecommendations =
    allOutput.includes("recommend") ||
    allOutput.includes("suggest") ||
    allOutput.includes("should");
  expect(hasRecommendations, "Output should contain recommendation keywords").to
    .be.true;
});

Then(
  "I should see recommendation {string}",
  function (this: InfraWorld, recommendation: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include(
      recommendation,
      `Output should contain recommendation: ${recommendation}`,
    );
  },
);

Then(
  "I should see command suggestion {string}",
  function (this: InfraWorld, command: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include(
      command,
      `Output should contain command suggestion: ${command}`,
    );
  },
);
