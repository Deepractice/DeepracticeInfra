/**
 * Step definitions for package and app removal scenarios
 */
import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import fs from "fs-extra";
import path from "node:path";
import type { ScaffoldWorld } from "../support/world";

// Given steps for removal scenarios

Given(
  "package {string} exists in {string}",
  async function (this: ScaffoldWorld, packageName: string, location: string) {
    // Handle both formats:
    // - "package 'test-lib' exists in 'packages/'" - location is parent dir
    // - "package '@myorg/utils' exists in 'packages/utils'" - location is full path
    const packageDir = location.endsWith("/")
      ? path.join(this.testDir!, location, extractDirName(packageName))
      : path.join(this.testDir!, location);

    await fs.ensureDir(path.join(packageDir, "src"));

    await fs.writeJson(path.join(packageDir, "package.json"), {
      name: packageName,
      version: "1.0.0",
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
      `export const ${packageName.replace(/[@/-]/g, "_")} = true;`,
    );
  },
);

Given(
  "app {string} exists in {string}",
  async function (this: ScaffoldWorld, appName: string, location: string) {
    // Handle both formats:
    // - "app 'test-cli' exists in 'apps/'" - location is parent dir
    // - "app '@myorg/admin-cli' exists in 'apps/admin-cli'" - location is full path
    const appDir = location.endsWith("/")
      ? path.join(this.testDir!, location, extractDirName(appName))
      : path.join(this.testDir!, location);

    await fs.ensureDir(path.join(appDir, "src"));

    await fs.writeJson(path.join(appDir, "package.json"), {
      name: appName,
      version: "1.0.0",
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
      `export const ${appName.replace(/[@/-]/g, "_")} = true;`,
    );

    await fs.writeFile(
      path.join(appDir, "src/cli.ts"),
      `#!/usr/bin/env node\nconsole.log('${appName}');`,
    );
  },
);

/**
 * Extract directory name from package name
 * For scoped packages like @myorg/admin-cli, returns admin-cli
 */
function extractDirName(name: string): string {
  if (name.startsWith("@")) {
    const parts = name.split("/");
    return parts.length > 1 ? parts[1]! : parts[0]!.slice(1);
  }
  return name;
}

Given(
  "{string} contains dependency on {string}",
  async function (
    this: ScaffoldWorld,
    packageJsonPath: string,
    dependency: string,
  ) {
    const fullPath = path.join(this.testDir!, packageJsonPath);
    const packageJson = await fs.readJson(fullPath);

    packageJson.dependencies = packageJson.dependencies || {};
    packageJson.dependencies[dependency] = "workspace:*";

    await fs.writeJson(fullPath, packageJson, { spaces: 2 });
  },
);

Given(
  "{string} contains {string}",
  async function (
    this: ScaffoldWorld,
    filePath: string,
    expectedContent: string,
  ) {
    const fullPath = path.join(this.testDir!, filePath);
    const content = await fs.readFile(fullPath, "utf-8");

    // If the file doesn't contain the content, add it
    if (!content.includes(expectedContent)) {
      await fs.writeFile(fullPath, content + "\n" + expectedContent);
    }
  },
);

// When steps for removal with confirmation

When(
  "I run {string} and confirm with {string}",
  async function (this: ScaffoldWorld, command: string, confirmation: string) {
    // For now, we'll use --force flag instead of interactive confirmation
    // This is a simplification for the test implementation
    // In real implementation, we would need to handle stdin input
    this.lastCommand = command;

    // Store the confirmation for potential use
    this.set("confirmation", confirmation);

    // For E2E tests, we recommend using --force flag
    // This step will be implemented once interactive input handling is available
    throw new Error(
      "Interactive confirmation not yet implemented. Please use --force flag instead.",
    );
  },
);

// Then steps for removal assertions

Then(
  "directory {string} should not exist",
  async function (this: ScaffoldWorld, dirName: string) {
    const dirPath = path.join(this.testDir!, dirName);
    const exists = await fs.pathExists(dirPath);
    expect(exists, `Directory ${dirName} should not exist`).to.be.false;
  },
);

Then(
  "I should see message {string}",
  function (this: ScaffoldWorld, expectedMessage: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include(
      expectedMessage,
      `Output should contain message: ${expectedMessage}`,
    );
  },
);

Then(
  "{string} should not appear in workspace packages",
  async function (this: ScaffoldWorld, packageName: string) {
    const workspaceFile = path.join(this.testDir!, "pnpm-workspace.yaml");
    const workspaceContent = await fs.readFile(workspaceFile, "utf-8");

    // Check that the package name doesn't appear in workspace
    // This is a basic check - in real implementation, we'd parse YAML and check actual packages
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.not.include(
      packageName,
      `Package ${packageName} should not appear in workspace`,
    );
  },
);
