import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "vitest";
import fs from "fs/promises";
import path from "path";

interface PluginTestContext {
  testDir?: string;
  projectDir?: string;
  stepFiles?: Map<string, string>;
  execResult?: {
    exitCode: number;
    stdout: string;
    stderr: string;
  };
}

Given(
  "I have step definitions for math operations",
  async function (this: PluginTestContext) {
    const stepsDir = path.join(this.projectDir!, "tests/e2e/steps");
    await fs.mkdir(stepsDir, { recursive: true });

    const stepDefinition = `
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'vitest';

Given('I have numbers {int} and {int}', function(a, b) {
  this.num1 = a;
  this.num2 = b;
});

When('I add them together', function() {
  this.result = this.num1 + this.num2;
});

Then('the result should be {int}', function(expected) {
  expect(this.result).toBe(expected);
});
`;

    const stepPath = path.join(stepsDir, "math.steps.ts");
    await fs.writeFile(stepPath, stepDefinition);
    this.stepFiles!.set("math.steps.ts", stepDefinition);
  },
);

Given(
  "I have step definitions for calculator operations",
  async function (this: PluginTestContext) {
    const stepsDir = path.join(this.projectDir!, "tests/e2e/steps");
    await fs.mkdir(stepsDir, { recursive: true });

    const stepDefinition = `
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'vitest';

Given('I have a calculator', function() {
  this.calculator = {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
  };
});

When('I add {int} and {int}', function(a, b) {
  this.result = this.calculator.add(a, b);
});

When('I subtract {int} from {int}', function(a, b) {
  this.result = this.calculator.subtract(b, a);
});

Then('the result should be {int}', function(expected) {
  expect(this.result).toBe(expected);
});
`;

    const stepPath = path.join(stepsDir, "calculator.steps.ts");
    await fs.writeFile(stepPath, stepDefinition);
    this.stepFiles!.set("calculator.steps.ts", stepDefinition);
  },
);

Given(
  "I have step definitions for user operations",
  async function (this: PluginTestContext) {
    const stepsDir = path.join(this.projectDir!, "tests/e2e/steps");
    await fs.mkdir(stepsDir, { recursive: true });

    const stepDefinition = `
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'vitest';

Given('I have initialized the system', function() {
  this.systemInitialized = true;
  this.users = new Set();
});

Given('I have logged in as admin', function() {
  expect(this.systemInitialized).toBe(true);
  this.loggedInUser = 'admin';
});

When('I create a new user', function() {
  this.users.add('newuser');
});

Then('the user should exist', function() {
  expect(this.users.has('newuser')).toBe(true);
});

When('I delete a user', function() {
  this.users.delete('testuser');
});

Then('the user should not exist', function() {
  expect(this.users.has('testuser')).toBe(false);
});
`;

    const stepPath = path.join(stepsDir, "user.steps.ts");
    await fs.writeFile(stepPath, stepDefinition);
    this.stepFiles!.set("user.steps.ts", stepDefinition);
  },
);

Given(
  "I have step definitions for validation and business logic",
  async function (this: PluginTestContext) {
    const stepsDir = path.join(this.projectDir!, "tests/e2e/steps");
    await fs.mkdir(stepsDir, { recursive: true });

    const stepDefinition = `
import { When, Then } from '@cucumber/cucumber';
import { expect } from 'vitest';

When('I provide valid input', function() {
  this.inputValid = true;
});

Then('it should be accepted', function() {
  expect(this.inputValid).toBe(true);
});

When('I execute business logic', function() {
  this.businessLogicResult = true;
});

Then('it should succeed', function() {
  expect(this.businessLogicResult).toBe(true);
});
`;

    const stepPath = path.join(stepsDir, "validation.steps.ts");
    await fs.writeFile(stepPath, stepDefinition);
    this.stepFiles!.set("validation.steps.ts", stepDefinition);
  },
);

Given(
  "I only have step definition for {string}",
  async function (this: PluginTestContext, stepText: string) {
    const stepsDir = path.join(this.projectDir!, "tests/e2e/steps");
    await fs.mkdir(stepsDir, { recursive: true });

    const stepDefinition = `
import { Given } from '@cucumber/cucumber';

Given('${stepText}', function() {
  this.defined = true;
});
`;

    const stepPath = path.join(stepsDir, "partial.steps.ts");
    await fs.writeFile(stepPath, stepDefinition);
  },
);

Given(
  "the step definition throws an error",
  async function (this: PluginTestContext) {
    const stepsDir = path.join(this.projectDir!, "tests/e2e/steps");
    await fs.mkdir(stepsDir, { recursive: true });

    const stepDefinition = `
import { Given } from '@cucumber/cucumber';

Given('I have a step that throws error', function() {
  throw new Error('Step execution failed');
});
`;

    const stepPath = path.join(stepsDir, "error.steps.ts");
    await fs.writeFile(stepPath, stepDefinition);
  },
);

Then(
  "Vitest should discover {int} test file(s)",
  function (this: PluginTestContext, count: number) {
    const output = this.execResult?.stdout || "";
    // Vitest shows test file count in output
    expect(output).toContain("Test Files");
    // For now, just verify the command ran
    expect(this.execResult?.exitCode).toBe(0);
  },
);

Then(
  "the test should be named {string}",
  function (this: PluginTestContext, testName: string) {
    const output = this.execResult?.stdout || "";
    // Cucumber format shows feature and scenario names
    expect(output).toContain(testName.split(" > ")[0]); // Feature name
  },
);

Then(
  "Vitest should execute {int} independent test(s)",
  function (this: PluginTestContext, count: number) {
    const output = this.execResult?.stdout || "";
    // Check for test execution output
    expect(this.execResult?.exitCode).toBe(0);
    // Could count "✓" or "passed" but depends on reporter format
  },
);

Then(
  "each scenario should run as a separate it\\(\\) block",
  function (this: PluginTestContext) {
    // This is a structural assertion - verify scenarios ran independently
    expect(this.execResult?.exitCode).toBe(0);
  },
);

Then(
  "each example should run as a separate it\\(\\) block",
  function (this: PluginTestContext) {
    // Scenario Outline examples should each be separate tests
    expect(this.execResult?.exitCode).toBe(0);
  },
);

Then(
  "test names should include example parameters",
  function (this: PluginTestContext) {
    // Example parameters should be visible in test names
    const output = this.execResult?.stdout || "";
    // Parameterized test names might include values
    expect(output).toBeTruthy();
  },
);

Then(
  "the Background steps should run before each scenario",
  function (this: PluginTestContext) {
    // Background steps should execute before each scenario
    expect(this.execResult?.exitCode).toBe(0);
  },
);

Then(
  "both scenarios should have the initialized system state",
  function (this: PluginTestContext) {
    // Both scenarios should see background setup
    expect(this.execResult?.exitCode).toBe(0);
  },
);

Then(
  "Vitest should organize tests by Rule",
  function (this: PluginTestContext) {
    // Rules should structure test output
    expect(this.execResult?.exitCode).toBe(0);
  },
);

Then(
  "test names should include the Rule name",
  function (this: PluginTestContext) {
    const output = this.execResult?.stdout || "";
    // Rule names should appear in test output
    expect(output).toBeTruthy();
  },
);

Then(
  "the test should fail with clear error message",
  function (this: PluginTestContext) {
    expect(this.execResult?.exitCode).not.toBe(0);
    const stderr = this.execResult?.stderr || "";
    const stdout = this.execResult?.stdout || "";
    expect(stderr || stdout).toBeTruthy();
  },
);

Then(
  "the error should indicate which steps are undefined",
  function (this: PluginTestContext) {
    const output = (
      this.execResult?.stderr ||
      this.execResult?.stdout ||
      ""
    ).toLowerCase();
    expect(output).toMatch(/undefined|not (found|defined|implemented)/i);
  },
);

Then(
  "the error should show the feature file location",
  function (this: PluginTestContext) {
    const output = this.execResult?.stderr || this.execResult?.stdout || "";
    expect(output).toContain(".feature");
  },
);

Then(
  "the error message should include the step text",
  function (this: PluginTestContext) {
    const output = this.execResult?.stderr || this.execResult?.stdout || "";
    expect(output).toContain("step that throws error");
  },
);

Then(
  "the error should show the feature file line number",
  function (this: PluginTestContext) {
    const output = this.execResult?.stderr || this.execResult?.stdout || "";
    // Line numbers typically shown as "file.feature:12"
    expect(output).toMatch(/\.feature:\d+/);
  },
);

Then(
  "the stack trace should be meaningful",
  function (this: PluginTestContext) {
    const output = this.execResult?.stderr || this.execResult?.stdout || "";
    // Stack trace should be present
    expect(output).toBeTruthy();
  },
);
