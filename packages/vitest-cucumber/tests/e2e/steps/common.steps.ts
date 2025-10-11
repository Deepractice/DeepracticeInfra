import { Given, When, Then, Before, After } from "@cucumber/cucumber";
import { expect } from "vitest";
import fs from "fs/promises";
import path from "path";
import os from "os";

interface TestContext {
  testDir?: string;
  projectDir?: string;
  vitestConfigPath?: string;
  featureFiles?: Map<string, string>;
  stepFiles?: Map<string, string>;
  execResult?: {
    exitCode: number;
    stdout: string;
    stderr: string;
  };
}

Before(async function (this: TestContext) {
  // Create a temporary directory for each scenario
  const tmpDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "vitest-cucumber-test-"),
  );
  this.testDir = tmpDir;
  this.projectDir = tmpDir;
  this.featureFiles = new Map();
  this.stepFiles = new Map();
});

After(async function (this: TestContext) {
  // Cleanup temporary directory
  if (this.testDir) {
    await fs.rm(this.testDir, { recursive: true, force: true });
  }
});

Given(
  "I have a Vitest project with vitest-cucumber plugin configured",
  async function (this: TestContext) {
    // Create a basic Vitest project structure
    const packageJson = {
      name: "test-project",
      type: "module",
      scripts: {
        test: "vitest run",
      },
      devDependencies: {
        vitest: "^3.0.0",
        "@deepracticex/vitest-cucumber": "workspace:*",
      },
    };

    await fs.writeFile(
      path.join(this.projectDir!, "package.json"),
      JSON.stringify(packageJson, null, 2),
    );

    // Create vitest config
    const vitestConfig = `
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});
`;

    this.vitestConfigPath = path.join(this.projectDir!, "vitest.config.ts");
    await fs.writeFile(this.vitestConfigPath, vitestConfig);
  },
);

Given(
  "I have created a features directory",
  async function (this: TestContext) {
    const featuresDir = path.join(this.projectDir!, "features");
    await fs.mkdir(featuresDir, { recursive: true });
  },
);

Given(
  "I have a feature file {string} with:",
  async function (this: TestContext, filePath: string, content: string) {
    const fullPath = path.join(this.projectDir!, filePath);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, content);
    this.featureFiles!.set(filePath, content);
  },
);

When("I run {string}", async function (this: TestContext, command: string) {
  const { execSync } = await import("child_process");

  try {
    const output = execSync(command, {
      cwd: this.projectDir,
      encoding: "utf-8",
      stdio: "pipe",
    });

    this.execResult = {
      exitCode: 0,
      stdout: output,
      stderr: "",
    };
  } catch (error: any) {
    this.execResult = {
      exitCode: error.status || 1,
      stdout: error.stdout || "",
      stderr: error.stderr || error.message || "",
    };
  }
});

Then("all tests should pass", function (this: TestContext) {
  expect(this.execResult?.exitCode).toBe(0);
});

Then("the test should fail", function (this: TestContext) {
  expect(this.execResult?.exitCode).not.toBe(0);
});
