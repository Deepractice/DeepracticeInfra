import { Before, After, BeforeAll, AfterAll, Then } from "@cucumber/cucumber";
import { expect } from "./test-helpers";

interface HookContext {
  testStartTime?: number;
  hookOrder?: string[];
}

const executionLog: string[] = [];

BeforeAll(function () {
  executionLog.push("BeforeAll");
});

Before(function (this: HookContext) {
  executionLog.push("Before");
  this.testStartTime = Date.now();
});

After(function () {
  executionLog.push("After");
});

AfterAll(function () {
  executionLog.push("AfterAll");
});

Then("the timestamp should be set", function (this: HookContext) {
  expect(this.testStartTime).toBeDefined();
  expect(typeof this.testStartTime).toBe("number");
});

Then(
  "hooks should execute in order: BeforeAll, Before, After, AfterAll",
  function () {
    // Verify BeforeAll ran first, Before ran before this step
    expect(executionLog[0]).toBe("BeforeAll");
    expect(executionLog[executionLog.length - 1]).toBe("Before");
  },
);
