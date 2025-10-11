/**
 * Step definitions for Result pattern
 */

import {
  Given,
  When,
  Then,
  DataTable,
} from "@deepracticex/testing-utils/cucumber";
import { expect } from "vitest";
import {
  ok,
  err,
  isOk,
  isErr,
  unwrap,
  unwrapOr,
  map,
  flatMap,
  errors,
} from "~/index.js";
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

Given(
  "I have user input data:",
  function (this: ErrorHandlingWorld, dataTable: DataTable) {
    const data: Record<string, string> = {};
    dataTable.hashes().forEach((row) => {
      const field = row.field;
      const value = row.value;
      if (field && value) {
        data[field] = value;
      }
    });
    this.userInput = data;
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

When(
  "I validate the input using Result pattern",
  function (this: ErrorHandlingWorld) {
    const input = this.userInput;

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const age = Number(input.age);

    const validationErrors: Record<string, string> = {};

    if (!emailRegex.test(input.email)) {
      validationErrors.email = "must be valid email";
    }

    if (age < 18) {
      validationErrors.age = "must be at least 18";
    }

    if (Object.keys(validationErrors).length > 0) {
      this.result = err(
        errors.validation("Invalid user data", validationErrors),
      );
    } else {
      this.result = ok(input);
    }
  },
);

When("I process the validated data", function (this: ErrorHandlingWorld) {
  this.result = map(this.result, (data: any) => ({
    ...data,
    processed: true,
    timestamp: new Date().toISOString(),
  }));
});

// Then steps
Then(
  "the result should have ok equal to true",
  function (this: ErrorHandlingWorld) {
    const result = this.get("result");
    expect(result.ok).toBe(true);
  },
);

Then(
  "the result value should be {string}",
  function (this: ErrorHandlingWorld, expectedValue: string) {
    const result = this.get("result");
    if (result.ok) {
      expect(result.value).toBe(expectedValue);
    } else {
      throw new Error("Result is not ok");
    }
  },
);

Then(
  "the result should have ok equal to false",
  function (this: ErrorHandlingWorld) {
    const result = this.get("result");
    expect(result.ok).toBe(false);
  },
);

Then(
  "the result error should be a NotFoundError",
  function (this: ErrorHandlingWorld) {
    const result = this.get("result");
    if (!result.ok) {
      expect(result.error.code).toBe("NOT_FOUND");
    } else {
      throw new Error("Result is ok, not error");
    }
  },
);

Then("the check should return true", function (this: ErrorHandlingWorld) {
  expect(this.get("checkResult")).toBe(true);
});

Then(
  "I should get the value {string}",
  function (this: ErrorHandlingWorld, expectedValue: string) {
    expect(this.get("unwrapped")).toBe(expectedValue);
  },
);

Then("it should throw the error", function (this: ErrorHandlingWorld) {
  expect(this.get("thrownError")).toBeDefined();
});

Then(
  "the result should be ok with value {string}",
  function (this: ErrorHandlingWorld, expectedValue: string) {
    const result = this.get("mappedResult");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(expectedValue);
    }
  },
);

Then("the result should still be err", function (this: ErrorHandlingWorld) {
  const result = this.get("mappedResult");
  expect(result.ok).toBe(false);
});

Then("the error should be preserved", function (this: ErrorHandlingWorld) {
  const result = this.get("mappedResult");
  if (!result.ok) {
    expect(result.error).toBeDefined();
  }
});

Then(
  "the result should be ok with user data",
  function (this: ErrorHandlingWorld) {
    const result = this.get("mappedResult");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveProperty("id");
      expect(result.value).toHaveProperty("name");
    }
  },
);

Then("the result should be err", function (this: ErrorHandlingWorld) {
  const result = this.result || this.get("mappedResult");
  expect(result.ok).toBe(false);
});

Then(
  "the error should be a NotFoundError",
  function (this: ErrorHandlingWorld) {
    const result = this.get("mappedResult");
    if (!result.ok) {
      expect(result.error.code).toBe("NOT_FOUND");
    }
  },
);

Then("the final result should be ok", function (this: ErrorHandlingWorld) {
  expect(this.result.ok).toBe(true);
});

Then(
  "the result should contain processed user data",
  function (this: ErrorHandlingWorld) {
    if (this.result.ok) {
      expect(this.result.value).toHaveProperty("processed", true);
      expect(this.result.value).toHaveProperty("timestamp");
    }
  },
);

Then(
  "the error should be a ValidationError",
  function (this: ErrorHandlingWorld) {
    if (!this.result.ok) {
      expect(this.result.error.code).toBe("VALIDATION_ERROR");
    }
  },
);

Then(
  "the error should contain field errors",
  function (this: ErrorHandlingWorld) {
    if (!this.result.ok) {
      expect(this.result.error.meta).toHaveProperty("fields");
      expect(this.result.error.meta.fields).toBeTypeOf("object");
    }
  },
);
