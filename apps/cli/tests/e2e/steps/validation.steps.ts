/**
 * Step definitions for validation scenarios (package, app, and monorepo)
 */
import { Given, Then, DataTable } from "@deepracticex/vitest-cucumber";
import { expect } from "chai";
import fs from "fs-extra";
import path from "node:path";
import type { InfraWorld } from "../support/world.js";

// Given steps for validation scenarios

Given(
  "package {string} exists in {string} with valid structure",
  async function (this: InfraWorld, packageName: string, location: string) {
    const packageDir = path.join(this.testDir!, location, packageName);
    await fs.ensureDir(path.join(packageDir, "src"));

    // Create valid package.json
    await fs.writeJson(path.join(packageDir, "package.json"), {
      name: packageName,
      version: "1.0.0",
      type: "module",
      main: "./dist/index.js",
      types: "./dist/index.d.ts",
    });

    // Create valid tsconfig.json
    await fs.writeJson(path.join(packageDir, "tsconfig.json"), {
      extends: "@deepracticex/typescript-config/base.json",
      compilerOptions: {
        outDir: "./dist",
        rootDir: "./src",
      },
      include: ["src/**/*"],
    });

    // Create src/index.ts
    await fs.writeFile(
      path.join(packageDir, "src/index.ts"),
      `export const ${packageName.replace(/-/g, "_").replace(/@/g, "").replace(/\//g, "_")} = true;`,
    );
  },
);

Given(
  "app {string} exists in {string} with valid structure",
  async function (this: InfraWorld, appName: string, location: string) {
    const appDir = path.join(this.testDir!, location, appName);
    await fs.ensureDir(path.join(appDir, "src"));

    // Create valid package.json with bin field
    await fs.writeJson(path.join(appDir, "package.json"), {
      name: appName,
      version: "1.0.0",
      type: "module",
      bin: {
        [appName]: "./dist/cli.js",
      },
    });

    // Create valid tsconfig.json
    await fs.writeJson(path.join(appDir, "tsconfig.json"), {
      extends: "@deepracticex/typescript-config/base.json",
      compilerOptions: {
        outDir: "./dist",
        rootDir: "./src",
      },
      include: ["src/**/*"],
    });

    // Create src/index.ts
    await fs.writeFile(
      path.join(appDir, "src/index.ts"),
      `export const ${appName.replace(/-/g, "_").replace(/@/g, "").replace(/\//g, "_")} = true;`,
    );

    // Create src/cli.ts
    await fs.writeFile(
      path.join(appDir, "src/cli.ts"),
      `#!/usr/bin/env node\nconsole.log('${appName}');`,
    );
  },
);

Given(
  "{string} does not exist",
  async function (this: InfraWorld, filePath: string) {
    const fullPath = path.join(this.testDir!, filePath);
    if (await fs.pathExists(fullPath)) {
      await fs.remove(fullPath);
    }
  },
);

Given(
  "{string} is missing {string} field",
  async function (this: InfraWorld, jsonPath: string, fieldName: string) {
    const fullPath = path.join(this.testDir!, jsonPath);
    const json = await fs.readJson(fullPath);
    delete json[fieldName];
    await fs.writeJson(fullPath, json, { spaces: 2 });
  },
);

Given(
  "{string} does not extend {string}",
  async function (
    this: InfraWorld,
    tsconfigPath: string,
    _extendsValue: string,
  ) {
    const fullPath = path.join(this.testDir!, tsconfigPath);
    const tsconfig = await fs.readJson(fullPath);
    delete tsconfig.extends;
    await fs.writeJson(fullPath, tsconfig, { spaces: 2 });
  },
);

Given(
  "package {string} exists in {string} with missing tsconfig.json",
  async function (this: InfraWorld, packageName: string, location: string) {
    const packageDir = path.join(this.testDir!, location, packageName);
    await fs.ensureDir(path.join(packageDir, "src"));

    // Create package.json but NOT tsconfig.json
    await fs.writeJson(path.join(packageDir, "package.json"), {
      name: packageName,
      version: "1.0.0",
      type: "module",
      main: "./dist/index.js",
      types: "./dist/index.d.ts",
    });

    await fs.writeFile(
      path.join(packageDir, "src/index.ts"),
      `export const ${packageName.replace(/-/g, "_")} = true;`,
    );
  },
);

Given(
  "app {string} exists in {string} with missing bin configuration",
  async function (this: InfraWorld, appName: string, location: string) {
    const appDir = path.join(this.testDir!, location, appName);
    await fs.ensureDir(path.join(appDir, "src"));

    // Create package.json WITHOUT bin field
    await fs.writeJson(path.join(appDir, "package.json"), {
      name: appName,
      version: "1.0.0",
      type: "module",
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
      `export const ${appName.replace(/-/g, "_")} = true;`,
    );
  },
);

Given(
  "{string} has {string} field pointing to non-existent file",
  async function (this: InfraWorld, jsonPath: string, fieldName: string) {
    const fullPath = path.join(this.testDir!, jsonPath);
    const json = await fs.readJson(fullPath);

    if (fieldName === "bin") {
      json.bin = {
        [json.name]: "./dist/non-existent.js",
      };
      // Create dist directory so validator will check the bin file
      const packageDir = path.dirname(fullPath);
      await fs.ensureDir(path.join(packageDir, "dist"));
    }

    await fs.writeJson(fullPath, json, { spaces: 2 });
  },
);

// Monorepo validation steps

Given(
  "the monorepo has been initialized with valid structure",
  async function (this: InfraWorld) {
    // Create complete valid monorepo structure
    await fs.writeJson(path.join(this.testDir!, "package.json"), {
      name: "test-monorepo",
      version: "1.0.0",
      private: true,
    });

    await fs.writeFile(
      path.join(this.testDir!, "pnpm-workspace.yaml"),
      `packages:
  - "packages/*"
  - "apps/*"
  - "services/*"
`,
    );

    await fs.writeJson(path.join(this.testDir!, "tsconfig.json"), {
      extends: "@deepracticex/typescript-config/base.json",
      references: [],
    });

    // Create directories
    await fs.ensureDir(path.join(this.testDir!, "packages"));
    await fs.ensureDir(path.join(this.testDir!, "apps"));
    await fs.ensureDir(path.join(this.testDir!, "services"));
  },
);

Given("the monorepo is initialized", async function (this: InfraWorld) {
  // Create minimal monorepo structure (may be incomplete)
  await fs.writeJson(path.join(this.testDir!, "package.json"), {
    name: "test-monorepo",
    version: "1.0.0",
    private: true,
  });

  await fs.writeFile(
    path.join(this.testDir!, "pnpm-workspace.yaml"),
    `packages:
  - "packages/*"
  - "apps/*"
`,
  );

  // Create tsconfig.json with references field for validation tests
  await fs.writeJson(path.join(this.testDir!, "tsconfig.json"), {
    compilerOptions: {
      target: "ES2020",
      module: "ESNext",
      moduleResolution: "bundler",
      strict: true,
    },
    references: [],
  });

  await fs.ensureDir(path.join(this.testDir!, "packages"));
  await fs.ensureDir(path.join(this.testDir!, "apps"));
});

Given(
  "file {string} does not exist",
  async function (this: InfraWorld, filePath: string) {
    const fullPath = path.join(this.testDir!, filePath);
    if (await fs.pathExists(fullPath)) {
      await fs.remove(fullPath);
    }
  },
);

Given(
  "directory {string} does not exist",
  async function (this: InfraWorld, dirPath: string) {
    const fullPath = path.join(this.testDir!, dirPath);
    if (await fs.pathExists(fullPath)) {
      await fs.remove(fullPath);
    }
  },
);

Given(
  "{string} does not contain {string}",
  async function (this: InfraWorld, filePath: string, expectedContent: string) {
    const fullPath = path.join(this.testDir!, filePath);
    const content = await fs.readFile(fullPath, "utf-8");

    // Remove the content if it exists
    if (content.includes(expectedContent)) {
      const newContent = content.replace(expectedContent, "");
      await fs.writeFile(fullPath, newContent);
    }
  },
);

Given(
  "{string} does not have {string} field",
  async function (this: InfraWorld, jsonPath: string, fieldName: string) {
    const fullPath = path.join(this.testDir!, jsonPath);

    // Check if file exists before trying to read it
    if (!(await fs.pathExists(fullPath))) {
      // Skip this step if file doesn't exist
      return;
    }

    const json = await fs.readJson(fullPath);
    delete json[fieldName];
    await fs.writeJson(fullPath, json, { spaces: 2 });
  },
);

Given(
  "{string} is invalid",
  async function (this: InfraWorld, filePath: string) {
    const fullPath = path.join(this.testDir!, filePath);

    if (filePath.endsWith(".json")) {
      // Write invalid JSON
      await fs.writeFile(fullPath, "{ invalid json }");
    } else if (filePath.endsWith(".yaml") || filePath.endsWith(".yml")) {
      // Write invalid YAML
      await fs.writeFile(fullPath, "invalid:\n  yaml:\nstructure");
    }
  },
);

Given(
  "the monorepo is partially initialized",
  async function (this: InfraWorld) {
    // Create incomplete monorepo structure
    await fs.writeJson(path.join(this.testDir!, "package.json"), {
      name: "test-monorepo",
      version: "1.0.0",
      private: true,
    });

    // Don't create pnpm-workspace.yaml or tsconfig.json
    // Create only one directory
    await fs.ensureDir(path.join(this.testDir!, "apps"));
  },
);

Given("the monorepo has validation errors", async function (this: InfraWorld) {
  // Create monorepo with intentional errors
  await fs.writeJson(path.join(this.testDir!, "package.json"), {
    name: "test-monorepo",
    version: "1.0.0",
    private: true,
  });

  // Missing pnpm-workspace.yaml
  // Missing packages directory
  await fs.ensureDir(path.join(this.testDir!, "apps"));
});

// Then steps for validation assertions

Then(
  "I should see all error messages:",
  function (this: InfraWorld, dataTable: DataTable) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    const rows = dataTable.raw().slice(1); // Skip header row

    for (const row of rows) {
      const errorMessage = row[0]!;
      expect(allOutput).to.include(
        errorMessage,
        `Output should contain error: ${errorMessage}`,
      );
    }
  },
);

Then(
  "I should see validation summary:",
  function (this: InfraWorld, dataTable: DataTable) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    const rows = dataTable.raw().slice(1); // Skip header row

    for (const row of rows) {
      const [status, count] = row;
      expect(allOutput).to.include(
        status!,
        `Output should contain status: ${status}`,
      );
      if (count) {
        expect(allOutput).to.include(
          count,
          `Output should contain count: ${count}`,
        );
      }
    }
  },
);

Then(
  "I should see error for {string}",
  function (this: InfraWorld, itemName: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include(
      itemName,
      `Output should contain error for: ${itemName}`,
    );
  },
);

Then(
  "I should see validation summary showing:",
  function (this: InfraWorld, dataTable: DataTable) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    const rows = dataTable.raw().slice(1); // Skip header row

    for (const row of rows) {
      const [component, status, errors] = row;
      expect(allOutput).to.include(
        component!,
        `Output should contain component: ${component}`,
      );
      if (status) {
        expect(allOutput).to.include(
          status,
          `Output should contain status: ${status}`,
        );
      }
      if (errors) {
        expect(allOutput).to.include(
          errors,
          `Output should contain errors: ${errors}`,
        );
      }
    }
  },
);

Then("I should see all errors listed", function (this: InfraWorld) {
  const allOutput = [...this.stdout, ...this.stderr].join("\n");
  expect(allOutput.length).to.be.greaterThan(
    0,
    "Output should contain error information",
  );
});

Then(
  "the command should exit with code {int}",
  function (this: InfraWorld, expectedCode: number) {
    expect(this.exitCode).to.equal(
      expectedCode,
      `Command should exit with code ${expectedCode}`,
    );
  },
);

Then(
  "the error output should contain validation errors",
  function (this: InfraWorld) {
    const output = this.stdout.join("\n");
    expect(output).to.include(
      "Monorepo validation failed",
      "Output should contain validation error message",
    );
  },
);
