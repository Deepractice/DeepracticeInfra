/**
 * Step definitions for configuration initialization scenarios
 */
import { Given, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import fs from "fs-extra";
import path from "node:path";
import type { ScaffoldWorld } from "../support/world";

// Given steps for config scenarios

Given(
  "file {string} already exists",
  async function (this: ScaffoldWorld, fileName: string) {
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
  async function (this: ScaffoldWorld, dataTable: { rawTable: string[][] }) {
    const rows = dataTable.rawTable.slice(1); // Skip header row

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
  async function (this: ScaffoldWorld, fileName: string) {
    const filePath = path.join(this.testDir!, fileName);
    const content = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(content);

    // Check for strict ESLint configuration
    expect(json).to.have.property("extends");
    expect(content).to.include(
      "strict",
      "ESLint config should contain strict rules",
    );
  },
);

Then(
  "{string} should contain strict formatting rules",
  async function (this: ScaffoldWorld, fileName: string) {
    const filePath = path.join(this.testDir!, fileName);
    const content = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(content);

    // Check for strict formatting configuration
    expect(json).to.be.an("object");
    expect(content).to.include(
      "strict",
      "Prettier config should contain strict rules",
    );
  },
);

Then(
  "{string} should be updated",
  async function (this: ScaffoldWorld, fileName: string) {
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
  async function (this: ScaffoldWorld, fileName: string) {
    const filePath = path.join(this.testDir!, fileName);
    const exists = await fs.pathExists(filePath);
    expect(exists, `File ${fileName} should not exist`).to.be.false;
  },
);

Then(
  "{string} should contain:",
  async function (
    this: ScaffoldWorld,
    fileName: string,
    dataTable: { rawTable: string[][] },
  ) {
    const filePath = path.join(this.testDir!, fileName);
    const content = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(content);

    const rows = dataTable.rawTable.slice(1); // Skip header row

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
