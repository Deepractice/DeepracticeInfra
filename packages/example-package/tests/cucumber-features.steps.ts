import {
  Given,
  When,
  Then,
  Before,
  After,
  DataTable,
} from "@deepracticex/vitest-cucumber";
import { expect } from "vitest";

interface TestContext {
  environment?: string;
  config?: Record<string, string>;
  users?: Array<Record<string, string>>;
  items?: number;
  price?: number;
  message?: string;
  jsonConfig?: any;
  num1?: number;
  num2?: number;
  sum?: number;
}

// Hooks
Before(function (this: TestContext) {
  console.log("✓ Before hook executed");
});

After(function (this: TestContext) {
  console.log("✓ After hook executed");
});

// Background
Given("I have initialized the test environment", function (this: TestContext) {
  this.environment = "test";
  console.log("✓ Test environment initialized");
});

// DataTable - rowsHash
When(
  "I create a configuration with:",
  function (this: TestContext, dataTable: DataTable) {
    this.config = dataTable.rowsHash();
  },
);

Then("the configuration should be loaded", function (this: TestContext) {
  expect(this.config).toBeDefined();
  expect(Object.keys(this.config!).length).toBeGreaterThan(0);
});

Then(
  "the API URL should be {string}",
  function (this: TestContext, url: string) {
    expect(this.config?.apiUrl).toBe(url);
  },
);

// DataTable - hashes
When(
  "I create multiple users:",
  function (this: TestContext, dataTable: DataTable) {
    this.users = dataTable.hashes();
  },
);

Then("I should have {int} users", function (this: TestContext, count: number) {
  expect(this.users).toBeDefined();
  expect(this.users!.length).toBe(count);
});

Then(
  "user {string} should have role {string}",
  function (this: TestContext, name: string, role: string) {
    const user = this.users?.find((u) => u.name === name);
    expect(user).toBeDefined();
    expect(user!.role).toBe(role);
  },
);

// Integer parameters
Given("I have {int} items", function (this: TestContext, count: number) {
  this.items = count;
  expect(typeof count).toBe("number");
});

When("I add {int} more items", function (this: TestContext, count: number) {
  this.items = (this.items || 0) + count;
});

Then(
  "I should have {int} items total",
  function (this: TestContext, expected: number) {
    expect(this.items).toBe(expected);
  },
);

// Float parameters
Given(
  "the price is {float} dollars",
  function (this: TestContext, price: number) {
    this.price = price;
    expect(typeof price).toBe("number");
  },
);

When(
  "I apply a {int}% discount",
  function (this: TestContext, discount: number) {
    this.price = this.price! * (1 - discount / 100);
  },
);

Then(
  "the final price should be {float} dollars",
  function (this: TestContext, expected: number) {
    expect(this.price).toBeCloseTo(expected, 2);
  },
);

// String parameters
Given(
  "I have a message {string}",
  function (this: TestContext, message: string) {
    this.message = message;
  },
);

Then(
  "the message should contain {string}",
  function (this: TestContext, substring: string) {
    expect(this.message).toContain(substring);
  },
);

// DocString
When(
  "I create a JSON configuration:",
  function (this: TestContext, docString: string) {
    this.jsonConfig = JSON.parse(docString);
  },
);

Then("the configuration should be valid JSON", function (this: TestContext) {
  expect(this.jsonConfig).toBeDefined();
  expect(typeof this.jsonConfig).toBe("object");
});

Then(
  "it should have feature {string}",
  function (this: TestContext, feature: string) {
    expect(this.jsonConfig.features).toContain(feature);
  },
);

// Scenario Outline
Given(
  "I have numbers {int} and {int}",
  function (this: TestContext, a: number, b: number) {
    this.num1 = a;
    this.num2 = b;
  },
);

When("I calculate their sum", function (this: TestContext) {
  this.sum = this.num1! + this.num2!;
});

Then(
  "the result should be {int}",
  function (this: TestContext, expected: number) {
    expect(this.sum).toBe(expected);
  },
);
