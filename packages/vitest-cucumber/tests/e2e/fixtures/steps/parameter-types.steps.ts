import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "./test-helpers";

interface ParameterContext {
  package?: string;
  num1?: number;
  num2?: number;
  result?: number;
  price?: number;
  userRole?: string;
}

// String parameters
Given(
  "I have installed {string}",
  function (this: ParameterContext, packageName: string) {
    this.package = packageName;
  },
);

Then(
  "the package should be {string}",
  function (this: ParameterContext, expected: string) {
    expect(this.package).toBe(expected);
    expect(typeof this.package).toBe("string");
  },
);

// Integer parameters
When(
  "I add {int} and {int}",
  function (this: ParameterContext, a: number, b: number) {
    this.num1 = a;
    this.num2 = b;
    this.result = a + b;
  },
);

Then(
  "the result should be {int}",
  function (this: ParameterContext, expected: number) {
    expect(this.result).toBe(expected);
    expect(typeof this.result).toBe("number");
  },
);

// Float parameters
Given("the price is {float}", function (this: ParameterContext, price: number) {
  this.price = price;
});

Then(
  "the price should be {float}",
  function (this: ParameterContext, expected: number) {
    expect(this.price).toBe(expected);
    expect(typeof this.price).toBe("number");
  },
);

// Word parameters
Given(
  "I am logged in as {word}",
  function (this: ParameterContext, role: string) {
    this.userRole = role;
  },
);

Then(
  "my role should be {string}",
  function (this: ParameterContext, expected: string) {
    expect(this.userRole).toBe(expected);
    expect(typeof this.userRole).toBe("string");
  },
);
