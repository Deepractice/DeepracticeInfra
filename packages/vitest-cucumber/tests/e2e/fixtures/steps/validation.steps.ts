import { When, Then } from "@cucumber/cucumber";
import { expect } from "./test-helpers";

interface ValidationContext {
  inputValid?: boolean;
  businessLogicResult?: boolean;
}

When("I provide valid input", function (this: ValidationContext) {
  this.inputValid = true;
});

Then("it should be accepted", function (this: ValidationContext) {
  expect(this.inputValid).toBe(true);
});

When("I execute business logic", function (this: ValidationContext) {
  this.businessLogicResult = true;
});

Then("it should succeed", function (this: ValidationContext) {
  expect(this.businessLogicResult).toBe(true);
});
