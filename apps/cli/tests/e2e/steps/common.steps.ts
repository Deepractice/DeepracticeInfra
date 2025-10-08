/**
 * Common step definitions for project E2E tests
 */
import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import { execa } from "execa";
import fs from "fs-extra";
import path from "node:path";
import os from "node:os";
import type { ProjectWorld } from "../support/world";

// Background steps
Given(
  "I am in a temporary test directory",
  async function (this: ProjectWorld) {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "nodespec-test-"));
    this.testDir = tmpDir.toString();
    this.originalCwd = process.cwd();
    process.chdir(tmpDir);
  },
);

Given("I am in an empty directory", async function (this: ProjectWorld) {
  if (!this.testDir) {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "nodespec-test-"));
    this.testDir = tmpDir.toString();
    this.originalCwd = process.cwd();
    process.chdir(tmpDir);
  }

  // Ensure directory is truly empty
  const files = await fs.readdir(this.testDir);
  if (files.length > 0) {
    await fs.emptyDir(this.testDir);
  }
});

Given("I am in a test directory", async function (this: ProjectWorld) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "nodespec-test-"));
  this.testDir = tmpDir.toString();
  this.originalCwd = process.cwd();
  process.chdir(tmpDir);
});

Given(
  "I am in a directory with an existing {string}",
  async function (this: ProjectWorld, filename: string) {
    if (!this.testDir) {
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "nodespec-test-"));
      this.testDir = tmpDir.toString();
      this.originalCwd = process.cwd();
      process.chdir(tmpDir);
    }

    // Create a simple package.json to simulate existing project
    if (filename === "package.json") {
      await fs.writeJson(path.join(this.testDir, filename), {
        name: "existing-project",
        version: "1.0.0",
      });
    }
  },
);

Given(
  "directory {string} exists",
  async function (this: ProjectWorld, dirName: string) {
    const dirPath = path.join(this.testDir!, dirName);
    await fs.ensureDir(dirPath);
  },
);

// When steps - command execution
When("I run {string}", async function (this: ProjectWorld, command: string) {
  this.lastCommand = command;

  try {
    // Get the CLI binary path
    const cliPath = path.resolve(__dirname, "../../../dist/cli.js");

    // Parse command and replace "nodespec" with actual CLI path
    const parts = command.split(" ");
    const args = parts.slice(1); // Remove "nodespec"

    this.lastResult = await execa("node", [cliPath, ...args], {
      cwd: process.cwd(),
      reject: false,
    });

    this.exitCode = this.lastResult.exitCode;
    if (this.lastResult.stdout) {
      this.stdout.push(this.lastResult.stdout);
    }
    if (this.lastResult.stderr) {
      this.stderr.push(this.lastResult.stderr);
    }
  } catch (error) {
    this.lastError = error as Error;
    this.exitCode = 1;
  }
});

When(
  "I run {string} in {string}",
  async function (this: ProjectWorld, command: string, directory: string) {
    this.lastCommand = command;
    const workDir = path.join(this.testDir!, directory);

    try {
      const parts = command.split(" ");
      const cmd = parts[0]!;
      const args = parts.slice(1);

      this.lastResult = await execa(cmd, args, {
        cwd: workDir,
        reject: false,
      });

      this.exitCode = this.lastResult.exitCode;
      if (this.lastResult.stdout) {
        this.stdout.push(this.lastResult.stdout);
      }
      if (this.lastResult.stderr) {
        this.stderr.push(this.lastResult.stderr);
      }
    } catch (error) {
      this.lastError = error as Error;
      this.exitCode = 1;
    }
  },
);

When(
  "I navigate to {string}",
  function (this: ProjectWorld, directory: string) {
    const targetDir = path.join(this.testDir!, directory);
    process.chdir(targetDir);
  },
);

// Then steps - assertions
Then("the command should succeed", function (this: ProjectWorld) {
  if (this.exitCode !== 0) {
    console.log("STDOUT:", this.stdout.join("\n"));
    console.log("STDERR:", this.stderr.join("\n"));
  }
  expect(this.exitCode).to.equal(0, `Command failed: ${this.lastCommand}`);
});

Then("the command should fail", function (this: ProjectWorld) {
  expect(this.exitCode).to.not.equal(
    0,
    `Command should have failed: ${this.lastCommand}`,
  );
});

Then(
  "I should see error message {string}",
  function (this: ProjectWorld, expectedMessage: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include(expectedMessage);
  },
);
