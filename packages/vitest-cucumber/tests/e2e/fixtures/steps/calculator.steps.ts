import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "./test-helpers";

interface CalculatorContext {
  calculator?: {
    value: number;
    add: (a: number, b: number) => number;
    subtract: (a: number, b: number) => number;
  };
  result?: number;
}

Given("I have a calculator", function (this: CalculatorContext) {
  this.calculator = {
    value: 0,
    add: (a: number, b: number) => a + b,
    subtract: (a: number, b: number) => a - b,
  };
});

When(
  "I add {int} and {int}",
  function (this: CalculatorContext, a: number, b: number) {
    this.result = this.calculator!.add(a, b);
  },
);

When(
  "I subtract {int} from {int}",
  function (this: CalculatorContext, a: number, b: number) {
    this.result = this.calculator!.subtract(b, a);
  },
);

Then(
  "the result should be {int}",
  function (this: CalculatorContext, expected: number) {
    expect(this.result).toBe(expected);
  },
);
