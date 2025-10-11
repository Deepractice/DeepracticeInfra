import { When, Then } from "@cucumber/cucumber";
import { expect } from "./test-helpers";

interface DataTableContext {
  user?: Record<string, string>;
  users?: Array<Record<string, string>>;
}

When(
  "I create a user with:",
  function (this: DataTableContext, dataTable: any) {
    this.user = dataTable.rowsHash();
  },
);

When("I create users:", function (this: DataTableContext, dataTable: any) {
  this.users = dataTable.hashes();
});

Then(
  "the user should have name {string}",
  function (this: DataTableContext, name: string) {
    expect(this.user?.name).toBe(name);
  },
);

Then(
  "the user should have email {string}",
  function (this: DataTableContext, email: string) {
    expect(this.user?.email).toBe(email);
  },
);

Then(
  "I should have {int} users",
  function (this: DataTableContext, count: number) {
    expect(this.users?.length).toBe(count);
  },
);

Then(
  "the first user should have name {string}",
  function (this: DataTableContext, name: string) {
    expect(this.users?.[0]?.name).toBe(name);
  },
);

Then(
  "the second user should have name {string}",
  function (this: DataTableContext, name: string) {
    expect(this.users?.[1]?.name).toBe(name);
  },
);
