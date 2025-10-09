/**
 * Workspace-specific step definitions for package and app management
 */
import { Given, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import fs from "fs-extra";
import path from "node:path";
import os from "node:os";
import type { ScaffoldWorld } from "../support/world";

// Given steps for workspace context

Given(
  "I am in a NodeSpec monorepo root directory",
  async function (this: ScaffoldWorld) {
    // Initialize a minimal monorepo structure for testing
    if (!this.testDir) {
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "nodespec-test-"));
      this.testDir = tmpDir.toString();
      this.originalCwd = process.cwd();
    }

    // Create minimal monorepo structure
    await fs.writeJson(path.join(this.testDir, "package.json"), {
      name: "test-monorepo",
      version: "1.0.0",
      private: true,
    });

    await fs.writeFile(
      path.join(this.testDir, "pnpm-workspace.yaml"),
      `packages:
  - "packages/*"
  - "src/*"
  - "apps/*"
  - "services/*"
`,
    );

    // Create workspace directories
    await fs.ensureDir(path.join(this.testDir, "packages"));
    await fs.ensureDir(path.join(this.testDir, "src"));
    await fs.ensureDir(path.join(this.testDir, "apps"));
    await fs.ensureDir(path.join(this.testDir, "services"));
  },
);

Given("I am in the monorepo root", async function (this: ScaffoldWorld) {
  // Alias for "I am in a NodeSpec monorepo root directory"
  if (!this.testDir) {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "nodespec-test-"));
    this.testDir = tmpDir.toString();
    this.originalCwd = process.cwd();
  }

  // Create minimal monorepo structure
  await fs.writeJson(path.join(this.testDir, "package.json"), {
    name: "test-monorepo",
    version: "1.0.0",
    private: true,
  });

  await fs.writeFile(
    path.join(this.testDir, "pnpm-workspace.yaml"),
    `packages:
  - "packages/*"
  - "src/*"
  - "apps/*"
  - "services/*"
`,
  );

  // Create workspace directories
  await fs.ensureDir(path.join(this.testDir, "packages"));
  await fs.ensureDir(path.join(this.testDir, "src"));
  await fs.ensureDir(path.join(this.testDir, "apps"));
  await fs.ensureDir(path.join(this.testDir, "services"));
});

Given(
  "the monorepo has been initialized",
  async function (this: ScaffoldWorld) {
    // Verify monorepo structure exists
    const workspaceFile = path.join(this.testDir!, "pnpm-workspace.yaml");
    const exists = await fs.pathExists(workspaceFile);

    if (!exists) {
      // If not initialized, create minimal structure
      await fs.writeJson(path.join(this.testDir!, "package.json"), {
        name: "test-monorepo",
        version: "1.0.0",
        private: true,
      });

      await fs.writeFile(
        workspaceFile,
        `packages:
  - "packages/*"
  - "src/*"
  - "apps/*"
  - "services/*"
`,
      );

      // Create workspace directories
      await fs.ensureDir(path.join(this.testDir!, "packages"));
      await fs.ensureDir(path.join(this.testDir!, "src"));
      await fs.ensureDir(path.join(this.testDir!, "apps"));
      await fs.ensureDir(path.join(this.testDir!, "services"));
    }
  },
);

Given(
  "package {string} already exists in {string}",
  async function (this: ScaffoldWorld, packageName: string, location: string) {
    const packageDir = path.join(this.testDir!, location, packageName);
    await fs.ensureDir(path.join(packageDir, "src"));

    await fs.writeJson(path.join(packageDir, "package.json"), {
      name: packageName,
      version: "0.0.1",
      type: "module",
      main: "./dist/index.js",
      types: "./dist/index.d.ts",
    });

    await fs.writeFile(
      path.join(packageDir, "src/index.ts"),
      `export const existing = true;`,
    );
  },
);

Given(
  "app {string} already exists in {string}",
  async function (this: ScaffoldWorld, appName: string, location: string) {
    const appDir = path.join(this.testDir!, location, appName);
    await fs.ensureDir(path.join(appDir, "src"));

    await fs.writeJson(path.join(appDir, "package.json"), {
      name: appName,
      version: "0.0.1",
      type: "module",
      bin: {
        [appName]: "./dist/cli.js",
      },
    });

    await fs.writeFile(
      path.join(appDir, "src/index.ts"),
      `export const existing = true;`,
    );

    await fs.writeFile(
      path.join(appDir, "src/cli.ts"),
      `#!/usr/bin/env node\nconsole.log('existing app');`,
    );
  },
);

Given("I am in a non-monorepo directory", async function (this: ScaffoldWorld) {
  if (!this.testDir) {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "nodespec-test-"));
    this.testDir = tmpDir.toString();
    this.originalCwd = process.cwd();
  }

  // Ensure no monorepo files exist
  const workspaceFile = path.join(this.testDir, "pnpm-workspace.yaml");
  const packageJson = path.join(this.testDir, "package.json");

  if (await fs.pathExists(workspaceFile)) {
    await fs.remove(workspaceFile);
  }

  if (await fs.pathExists(packageJson)) {
    await fs.remove(packageJson);
  }
});

// Then steps for workspace validation

Then(
  "file {string} should be executable",
  async function (this: ScaffoldWorld, filePath: string) {
    const fullPath = path.join(this.testDir!, filePath);
    const exists = await fs.pathExists(fullPath);
    expect(exists, `File ${filePath} should exist`).to.be.true;

    // Read file content to check for shebang
    const content = await fs.readFile(fullPath, "utf-8");
    expect(content).to.match(
      /^#!\/usr\/bin\/env node/,
      `File ${filePath} should have executable shebang`,
    );

    // On Unix systems, also check file permissions
    if (process.platform !== "win32") {
      const stats = await fs.stat(fullPath);
      const isExecutable = (stats.mode & 0o111) !== 0;
      expect(
        isExecutable,
        `File ${filePath} should have executable permissions`,
      ).to.be.true;
    }
  },
);
