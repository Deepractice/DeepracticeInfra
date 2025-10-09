/**
 * Step definitions for package and app list scenarios
 */
import { Given, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import fs from "fs-extra";
import path from "node:path";
import type { ScaffoldWorld } from "../support/world";

// Given steps for list scenarios

Given(
  "package {string} exists in {string} with version {string}",
  async function (
    this: ScaffoldWorld,
    packageName: string,
    location: string,
    version: string,
  ) {
    const packageDir = path.join(this.testDir!, location, packageName);
    await fs.ensureDir(path.join(packageDir, "src"));

    await fs.writeJson(path.join(packageDir, "package.json"), {
      name: packageName,
      version: version,
      type: "module",
      main: "./dist/index.js",
      types: "./dist/index.d.ts",
    });

    await fs.writeJson(path.join(packageDir, "tsconfig.json"), {
      extends: "@deepracticex/typescript-config/base.json",
      compilerOptions: {
        outDir: "./dist",
        rootDir: "./src",
      },
      include: ["src/**/*"],
    });

    await fs.writeFile(
      path.join(packageDir, "src/index.ts"),
      `export const ${packageName.replace(/-/g, "_").replace(/@/g, "").replace(/\//g, "_")} = true;`,
    );
  },
);

Given(
  "app {string} exists in {string} with version {string}",
  async function (
    this: ScaffoldWorld,
    appName: string,
    location: string,
    version: string,
  ) {
    const appDir = path.join(this.testDir!, location, appName);
    await fs.ensureDir(path.join(appDir, "src"));

    await fs.writeJson(path.join(appDir, "package.json"), {
      name: appName,
      version: version,
      type: "module",
      bin: {
        [appName]: "./dist/cli.js",
      },
    });

    await fs.writeJson(path.join(appDir, "tsconfig.json"), {
      extends: "@deepracticex/typescript-config/base.json",
      compilerOptions: {
        outDir: "./dist",
        rootDir: "./src",
      },
      include: ["src/**/*"],
    });

    await fs.writeFile(
      path.join(appDir, "src/index.ts"),
      `export const ${appName.replace(/-/g, "_").replace(/@/g, "").replace(/\//g, "_")} = true;`,
    );

    await fs.writeFile(
      path.join(appDir, "src/cli.ts"),
      `#!/usr/bin/env node\nconsole.log('${appName}');`,
    );
  },
);

Given(
  "{string} directory is empty",
  async function (this: ScaffoldWorld, dirName: string) {
    const dirPath = path.join(this.testDir!, dirName);
    await fs.ensureDir(dirPath);
    await fs.emptyDir(dirPath);
  },
);

// Then steps for list output validation

Then(
  "I should see output containing:",
  function (this: ScaffoldWorld, dataTable: { rawTable: string[][] }) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    const rows = dataTable.rawTable.slice(1); // Skip header row

    for (const row of rows) {
      const [item, version] = row;
      expect(allOutput).to.include(item!, `Output should contain ${item}`);
      if (version) {
        expect(allOutput).to.include(
          version,
          `Output should contain version ${version}`,
        );
      }
    }
  },
);

Then(
  "I should see package {string} with details:",
  function (
    this: ScaffoldWorld,
    packageName: string,
    dataTable: { rawTable: string[][] },
  ) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include(
      packageName,
      `Output should contain package ${packageName}`,
    );

    const rows = dataTable.rawTable.slice(1); // Skip header row
    for (const row of rows) {
      const [field, value] = row;
      expect(allOutput).to.include(
        value!,
        `Output should contain ${field}: ${value}`,
      );
    }
  },
);

Then(
  "I should see app {string} with details:",
  function (
    this: ScaffoldWorld,
    appName: string,
    dataTable: { rawTable: string[][] },
  ) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include(
      appName,
      `Output should contain app ${appName}`,
    );

    const rows = dataTable.rawTable.slice(1); // Skip header row
    for (const row of rows) {
      const [field, value] = row;
      expect(allOutput).to.include(
        value!,
        `Output should contain ${field}: ${value}`,
      );
    }
  },
);

Then("the output should be valid JSON", function (this: ScaffoldWorld) {
  const allOutput = [...this.stdout, ...this.stderr].join("\n");

  try {
    JSON.parse(allOutput);
  } catch (error) {
    throw new Error(`Output is not valid JSON: ${allOutput}`);
  }
});

Then(
  "the JSON should contain package {string} with version {string}",
  function (this: ScaffoldWorld, packageName: string, version: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    const json = JSON.parse(allOutput);

    // Check if the JSON contains the package with the expected version
    let found = false;
    if (Array.isArray(json)) {
      found = json.some(
        (pkg: { name: string; version: string }) =>
          pkg.name === packageName && pkg.version === version,
      );
    } else if (json.packages) {
      found = json.packages.some(
        (pkg: { name: string; version: string }) =>
          pkg.name === packageName && pkg.version === version,
      );
    }

    expect(
      found,
      `JSON should contain package ${packageName} with version ${version}`,
    ).to.be.true;
  },
);

Then(
  "the JSON should contain app {string} with version {string}",
  function (this: ScaffoldWorld, appName: string, version: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    const json = JSON.parse(allOutput);

    // Check if the JSON contains the app with the expected version
    let found = false;
    if (Array.isArray(json)) {
      found = json.some(
        (app: { name: string; version: string }) =>
          app.name === appName && app.version === version,
      );
    } else if (json.apps) {
      found = json.apps.some(
        (app: { name: string; version: string }) =>
          app.name === appName && app.version === version,
      );
    }

    expect(found, `JSON should contain app ${appName} with version ${version}`)
      .to.be.true;
  },
);

Then(
  "I should see {string} with location {string}",
  function (this: ScaffoldWorld, itemName: string, location: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include(itemName, `Output should contain ${itemName}`);
    expect(allOutput).to.include(
      location,
      `Output should contain location ${location}`,
    );
  },
);

Then(
  "I should see package {string} with location {string}",
  function (this: ScaffoldWorld, packageName: string, location: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include(
      packageName,
      `Output should contain package ${packageName}`,
    );
    expect(allOutput).to.include(
      location,
      `Output should contain location ${location}`,
    );
  },
);

Then(
  "I should see app {string} with location {string}",
  function (this: ScaffoldWorld, appName: string, location: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include(
      appName,
      `Output should contain app ${appName}`,
    );
    expect(allOutput).to.include(
      location,
      `Output should contain location ${location}`,
    );
  },
);
