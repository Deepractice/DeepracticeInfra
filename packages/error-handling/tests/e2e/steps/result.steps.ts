/**
 * Step definitions for Result pattern
 */

import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import {
  ok,
  err,
  isOk,
  isErr,
  unwrap,
  unwrapOr,
  map,
  flatMap,
} from "../../../src/index.js";
import { errors } from "../../../src/index.js";
import type { ErrorHandlingWorld } from "../support/world.js";

// Given steps
Given(
  "I have the Result utilities imported",
  function (this: ErrorHandlingWorld) {
    this.set("ok", ok);
    this.set("err", err);
  },
);

Given(
  "I have an ok result with value {string}",
  function (this: ErrorHandlingWorld, value: string) {
    this.set("result", ok(value));
  },
);

Given(
  "I have an err result with an error",
  function (this: ErrorHandlingWorld) {
    this.set("result", err(errors.notFound("Resource")));
  },
);

Given(
  "I have an err result with a NotFoundError",
  function (this: ErrorHandlingWorld) {
    this.set("result", err(errors.notFound("Resource")));
  },
);

// When steps
When(
  "I create an ok result with value {string}",
  function (this: ErrorHandlingWorld, value: string) {
    this.set("result", ok(value));
  },
);

When(
  "I create an err result with a NotFoundError",
  function (this: ErrorHandlingWorld) {
    this.set("result", err(errors.notFound("Resource")));
  },
);

When("I check if the result is ok", function (this: ErrorHandlingWorld) {
  const result = this.get("result");
  this.set("checkResult", isOk(result));
});

When("I check if the result is err", function (this: ErrorHandlingWorld) {
  const result = this.get("result");
  this.set("checkResult", isErr(result));
});

When("I unwrap the result", function (this: ErrorHandlingWorld) {
  const result = this.get("result");
  this.set("unwrapped", unwrap(result));
});

When("I try to unwrap the result", function (this: ErrorHandlingWorld) {
  const result = this.get("result");
  try {
    unwrap(result);
  } catch (error) {
    this.set("thrownError", error);
  }
});

When(
  "I unwrap the result with default value {string}",
  function (this: ErrorHandlingWorld, defaultValue: string) {
    const result = this.get("result");
    this.set("unwrapped", unwrapOr(result, defaultValue));
  },
);

When(
  "I map the result to double the value",
  function (this: ErrorHandlingWorld) {
    const result = this.get("result");
    this.set(
      "mappedResult",
      map(result, (value: any) => String(Number(value) * 2)),
    );
  },
);

When(
  "I flatMap the result to fetch user details",
  function (this: ErrorHandlingWorld) {
    const result = this.get("result");
    this.set(
      "mappedResult",
      flatMap(result, (userId: string) => {
        if (userId === "invalid-id") {
          return err(errors.notFound("User", userId));
        }
        return ok({ id: userId, name: "John Doe" });
      }),
    );
  },
);

// Then steps
Then(
  "the result should have ok equal to true",
  function (this: ErrorHandlingWorld) {
    const result = this.get("result");
    expect(result.ok).to.be.true;
  },
);

Then(
  "the result value should be {string}",
  function (this: ErrorHandlingWorld, expectedValue: string) {
    const result = this.get("result");
    if (result.ok) {
      expect(result.value).to.equal(expectedValue);
    } else {
      throw new Error("Result is not ok");
    }
  },
);

Then(
  "the result should have ok equal to false",
  function (this: ErrorHandlingWorld) {
    const result = this.get("result");
    expect(result.ok).to.be.false;
  },
);

Then(
  "the result error should be a NotFoundError",
  function (this: ErrorHandlingWorld) {
    const result = this.get("result");
    if (!result.ok) {
      expect(result.error.code).to.equal("NOT_FOUND");
    } else {
      throw new Error("Result is ok, not error");
    }
  },
);

Then("the check should return true", function (this: ErrorHandlingWorld) {
  expect(this.get("checkResult")).to.be.true;
});

Then(
  "I should get the value {string}",
  function (this: ErrorHandlingWorld, expectedValue: string) {
    expect(this.get("unwrapped")).to.equal(expectedValue);
  },
);

Then("it should throw the error", function (this: ErrorHandlingWorld) {
  expect(this.get("thrownError")).to.exist;
});

Then(
  "the result should be ok with value {string}",
  function (this: ErrorHandlingWorld, expectedValue: string) {
    const result = this.get("mappedResult");
    expect(result.ok).to.be.true;
    if (result.ok) {
      expect(result.value).to.equal(expectedValue);
    }
  },
);

Then("the result should still be err", function (this: ErrorHandlingWorld) {
  const result = this.get("mappedResult");
  expect(result.ok).to.be.false;
});

Then("the error should be preserved", function (this: ErrorHandlingWorld) {
  const result = this.get("mappedResult");
  if (!result.ok) {
    expect(result.error).to.exist;
  }
});

Then(
  "the result should be ok with user data",
  function (this: ErrorHandlingWorld) {
    const result = this.get("mappedResult");
    expect(result.ok).to.be.true;
    if (result.ok) {
      expect(result.value).to.have.property("id");
      expect(result.value).to.have.property("name");
    }
  },
);

Then("the result should be err", function (this: ErrorHandlingWorld) {
  const result = this.get("mappedResult");
  expect(result.ok).to.be.false;
});

Then(
  "the error should be a NotFoundError",
  function (this: ErrorHandlingWorld) {
    const result = this.get("mappedResult");
    if (!result.ok) {
      expect(result.error.code).to.equal("NOT_FOUND");
    }
  },
);
