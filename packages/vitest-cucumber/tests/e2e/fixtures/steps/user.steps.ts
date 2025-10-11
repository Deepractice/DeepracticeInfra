import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "vitest";

interface UserContext {
  systemInitialized?: boolean;
  loggedInUser?: string;
  users?: Set<string>;
}

Given("I have initialized the system", function (this: UserContext) {
  this.systemInitialized = true;
  this.users = new Set();
});

Given("I have logged in as admin", function (this: UserContext) {
  expect(this.systemInitialized).toBe(true);
  this.loggedInUser = "admin";
});

When("I create a new user", function (this: UserContext) {
  expect(this.systemInitialized).toBe(true);
  this.users!.add("newuser");
});

Then("the user should exist", function (this: UserContext) {
  expect(this.users!.has("newuser")).toBe(true);
});

When("I delete a user", function (this: UserContext) {
  expect(this.systemInitialized).toBe(true);
  this.users!.delete("testuser");
});

Then("the user should not exist", function (this: UserContext) {
  expect(this.users!.has("testuser")).toBe(false);
});
