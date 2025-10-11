/**
 * Common step definitions for infra E2E tests
 */
import { Given, When, Then } from "@deepracticex/testing-utils";
import { expect } from "chai";
import { execa } from "execa";
import fs from "fs-extra";
import path from "node:path";
import os from "node:os";
import type { InfraWorld } from "../support/world.js";

// Background steps
Given("I am in a temporary test directory", async function (this: InfraWorld) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "nodespec-test-"));
  this.testDir = tmpDir.toString();
  this.originalCwd = process.cwd();
  // Don't change process.cwd() - keep it in project root for module resolution
});

Given("I am in an empty directory", async function (this: InfraWorld) {
  if (!this.testDir) {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "nodespec-test-"));
    this.testDir = tmpDir.toString();
    this.originalCwd = process.cwd();
    // Don't change process.cwd() - keep it in project root for module resolution
  }

  // Ensure directory is truly empty
  const files = await fs.readdir(this.testDir);
  if (files.length > 0) {
    await fs.emptyDir(this.testDir);
  }
});

Given("I am in a test directory", async function (this: InfraWorld) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "nodespec-test-"));
  this.testDir = tmpDir.toString();
  this.originalCwd = process.cwd();
  // Don't change process.cwd() - keep it in project root for module resolution
});

Given(
  "I am in a directory with an existing {string}",
  async function (this: InfraWorld, filename: string) {
    if (!this.testDir) {
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "nodespec-test-"));
      this.testDir = tmpDir.toString();
      this.originalCwd = process.cwd();
      // Don't change process.cwd() - keep it in project root for module resolution
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
  async function (this: InfraWorld, dirName: string) {
    const dirPath = path.join(this.testDir!, dirName);
    await fs.ensureDir(dirPath);
  },
);

// When steps - command execution
When("I run {string}", async function (this: InfraWorld, command: string) {
  this.lastCommand = command;

  try {
    const parts = command.split(" ");
    let cliPath: string | undefined;

    // Check if this is a nodespec command or a shell command
    if (parts[0] === "nodespec") {
      // Execute nodespec CLI command
      const projectRoot = this.originalCwd || process.cwd();
      cliPath = path.resolve(projectRoot, "dist/cli.js");
      const args = parts.slice(1); // Remove "nodespec"

      this.lastResult = await execa("node", [cliPath, ...args], {
        cwd: this.testDir || process.cwd(),
        reject: false,
        env: {
          ...process.env,
          NODE_OPTIONS: undefined, // Remove NODE_OPTIONS to avoid tsx being required in test dirs
        },
      });
    } else {
      // Execute regular shell command
      const cmd = parts[0]!;
      let args = parts.slice(1);

      // In CI, pnpm install needs --no-frozen-lockfile for tests that dynamically add packages
      if (process.env.CI && cmd === "pnpm" && args[0] === "install") {
        args.push("--no-frozen-lockfile");
      }

      this.lastResult = await execa(cmd, args, {
        cwd: this.testDir || process.cwd(),
        reject: false,
        env: {
          ...process.env,
          NODE_OPTIONS: undefined, // Remove NODE_OPTIONS to avoid tsx being required in test dirs
        },
      });
    }

    this.exitCode = this.lastResult.exitCode;
    if (this.lastResult.stdout) {
      this.stdout.push(String(this.lastResult.stdout));
    }
    if (this.lastResult.stderr) {
      this.stderr.push(String(this.lastResult.stderr));
    }

    // Debug logging
    if (this.exitCode !== 0) {
      console.error("[DEBUG] Command failed:", command);
      if (cliPath) {
        console.error("[DEBUG] CLI path:", cliPath);
      }
      console.error("[DEBUG] CWD:", this.testDir || process.cwd());
      console.error("[DEBUG] Exit code:", this.exitCode);
      console.error("[DEBUG] STDOUT:", this.lastResult.stdout || "(empty)");
      console.error("[DEBUG] STDERR:", this.lastResult.stderr || "(empty)");
    }
  } catch (error) {
    this.lastError = error as Error;
    this.exitCode = 1;
    console.error("[DEBUG] Exception caught:", error);
  }
});

When(
  "I run {string} in {string}",
  async function (this: InfraWorld, command: string, directory: string) {
    this.lastCommand = command;
    const workDir = path.join(this.testDir!, directory);

    try {
      const parts = command.split(" ");
      const cmd = parts[0]!;
      const args = parts.slice(1);

      this.lastResult = await execa(cmd, args, {
        cwd: workDir,
        reject: false,
        env: {
          ...process.env,
          NODE_OPTIONS: undefined, // Remove NODE_OPTIONS to avoid tsx being required in test dirs
        },
      });

      this.exitCode = this.lastResult.exitCode;
      if (this.lastResult.stdout) {
        this.stdout.push(String(this.lastResult.stdout));
      }
      if (this.lastResult.stderr) {
        this.stderr.push(String(this.lastResult.stderr));
      }
    } catch (error) {
      this.lastError = error as Error;
      this.exitCode = 1;
    }
  },
);

When("I navigate to {string}", function (this: InfraWorld, directory: string) {
  const targetDir = path.join(this.testDir!, directory);
  // Update testDir to the new directory instead of changing process.cwd()
  this.testDir = targetDir;
});

// Then steps - assertions
Then("the command should succeed", function (this: InfraWorld) {
  if (this.exitCode !== 0) {
    console.log("STDOUT:", this.stdout.join("\n"));
    console.log("STDERR:", this.stderr.join("\n"));
  }
  expect(this.exitCode).to.equal(0, `Command failed: ${this.lastCommand}`);
});

Then("the command should fail", function (this: InfraWorld) {
  expect(this.exitCode).to.not.equal(
    0,
    `Command should have failed: ${this.lastCommand}`,
  );
});

Then(
  "I should see error message {string}",
  function (this: InfraWorld, expectedMessage: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include(expectedMessage);
  },
);

Then(
  "I should see message {string}",
  function (this: InfraWorld, expectedMessage: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include(expectedMessage);
  },
);

Then(
  "I should see suggestion {string}",
  function (this: InfraWorld, suggestion: string) {
    const allOutput = [...this.stdout, ...this.stderr].join("\n");
    expect(allOutput).to.include(
      suggestion,
      `Output should contain suggestion: ${suggestion}`,
    );
  },
);
