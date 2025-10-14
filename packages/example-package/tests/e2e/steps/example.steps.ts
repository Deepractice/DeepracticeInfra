/**
 * Step definitions for Example feature
 */
import { Given, When, Then } from "@deepracticex/vitest-cucumber/cucumber";
import { expect } from "vitest";
import { createExample } from "@/index";
import type { ExampleWorld } from "../support/world";

// Given steps
Given("I have created an Example instance", function (this: ExampleWorld) {
  this.example = createExample();
});

Given(
  "I have created an Example instance with enabled: {word}",
  function (this: ExampleWorld, enabled: string) {
    this.example = createExample({ enabled: enabled === "true" });
  },
);

Given(
  "I have created an Example instance with debug: {word}",
  function (this: ExampleWorld, debug: string) {
    // Capture console.log
    const originalLog = console.log;
    console.log = (...args: unknown[]) => {
      this.consoleLogs.push(args.join(" "));
      originalLog(...args);
    };

    this.example = createExample({ debug: debug === "true" });

    // Store cleanup function in world
    this.set("restoreConsole", () => {
      console.log = originalLog;
    });
  },
);

Given(
  "I have created another Example instance with enabled: {word}",
  function (this: ExampleWorld, enabled: string) {
    this.secondExample = createExample({ enabled: enabled === "true" });
  },
);

// When steps
When(
  "I execute with input {string}",
  async function (this: ExampleWorld, input: string) {
    try {
      this.result = await this.example!.execute(input);
    } catch (error) {
      this.error = error as Error;
    }
  },
);

When("I check the status", function (this: ExampleWorld) {
  this.result = this.example!.status();
});

When("I check the status of first instance", function (this: ExampleWorld) {
  this.result = this.example!.status();
});

When("I check the status of second instance", function (this: ExampleWorld) {
  this.result = this.secondExample!.status();
});

When("I dispose the instance", function (this: ExampleWorld) {
  this.example!.dispose();
});

// Then steps
Then(
  "the result should be {string}",
  function (this: ExampleWorld, expected: string) {
    expect(this.result).toBe(expected);
  },
);

Then(
  "the status should be {string}",
  function (this: ExampleWorld, expected: string) {
    expect(this.result).toBe(expected);
  },
);

Then(
  "it should throw an error {string}",
  function (this: ExampleWorld, expectedMessage: string) {
    expect(this.error).toBeDefined();
    expect(this.error!.message).toContain(expectedMessage);
  },
);

Then("it should log the processing message", function (this: ExampleWorld) {
  expect(this.consoleLogs.length).toBeGreaterThan(0);
  expect(this.consoleLogs.some((log) => log.includes("Processing:"))).toBe(
    true,
  );
});

Then("the instance should be cleaned up", function (this: ExampleWorld) {
  // In real scenario, you would verify resources are released
  expect(this.example).toBeDefined();
});
