import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "vitest";

interface MathContext {
  num1?: number;
  num2?: number;
  result?: number;
}

Given(
  "I have numbers {int} and {int}",
  function (this: MathContext, a: number, b: number) {
    this.num1 = a;
    this.num2 = b;
  },
);

When("I add them together", function (this: MathContext) {
  this.result = (this.num1 || 0) + (this.num2 || 0);
});

Then(
  "the result should be {int}",
  function (this: MathContext, expected: number) {
    expect(this.result).toBe(expected);
  },
);
