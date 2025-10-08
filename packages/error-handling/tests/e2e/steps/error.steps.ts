/**
 * Step definitions for error factory and error creation
 */

import { Given, When, Then, DataTable } from "@cucumber/cucumber";
import { expect } from "chai";
import { errors, AppError } from "../../../src/index.js";
import type { ErrorHandlingWorld } from "../support/world.js";

// Background steps
Given("I have the error factory imported", function (this: ErrorHandlingWorld) {
  this.errorFactory = errors;
});

// When steps - Creating errors
When(
  "I create a {string} error",
  function (this: ErrorHandlingWorld, errorType: string) {
    switch (errorType) {
      case "notFound":
        this.error = this.errorFactory.notFound("Resource");
        break;
      case "unauthorized":
        this.error = this.errorFactory.unauthorized();
        break;
      case "forbidden":
        this.error = this.errorFactory.forbidden();
        break;
      case "validation":
        this.error = this.errorFactory.validation("Invalid data");
        break;
      case "conflict":
        this.error = this.errorFactory.conflict("Resource already exists");
        break;
      case "unprocessable":
        this.error = this.errorFactory.unprocessable("Cannot process");
        break;
      case "rateLimit":
        this.error = this.errorFactory.rateLimit();
        break;
      case "internal":
        this.error = this.errorFactory.internal("Internal server error");
        break;
      case "unavailable":
        this.error = this.errorFactory.unavailable();
        break;
      default:
        throw new Error(`Unknown error type: ${errorType}`);
    }
  },
);

When(
  "I create a not found error for {string} with identifier {string}",
  function (this: ErrorHandlingWorld, resource: string, identifier: string) {
    this.error = this.errorFactory.notFound(resource, identifier);
  },
);

When(
  "I create a not found error for {string}",
  function (this: ErrorHandlingWorld, resource: string) {
    this.error = this.errorFactory.notFound(resource);
  },
);

When(
  "I create a validation error with message {string} and fields:",
  function (this: ErrorHandlingWorld, message: string, dataTable: DataTable) {
    const fields: Record<string, string> = {};
    dataTable.hashes().forEach((row) => {
      const field = row.field;
      const msg = row.message;
      if (field && msg) {
        fields[field] = msg;
      }
    });
    this.error = this.errorFactory.validation(message, fields);
  },
);

When(
  "I create a database error with message {string} and operation {string}",
  function (this: ErrorHandlingWorld, message: string, operation: string) {
    this.error = this.errorFactory.database(message, operation);
  },
);

When(
  "I create an external service error for {string} with message {string}",
  function (this: ErrorHandlingWorld, service: string, message: string) {
    this.error = this.errorFactory.externalService(service, message);
  },
);

When("I serialize the error to JSON", function (this: ErrorHandlingWorld) {
  this.errorJson = this.error!.toJSON();
});

// Then steps - Assertions
Then(
  "the error should be an instance of AppError",
  function (this: ErrorHandlingWorld) {
    expect(AppError.isAppError(this.error)).to.be.true;
  },
);

Then(
  "the error status code should be {int}",
  function (this: ErrorHandlingWorld, statusCode: number) {
    expect(this.error!.statusCode).to.equal(statusCode);
  },
);

Then(
  "the error code should be {string}",
  function (this: ErrorHandlingWorld, errorCode: string) {
    expect(this.error!.code).to.equal(errorCode);
  },
);

Then(
  "the error message should be {string}",
  function (this: ErrorHandlingWorld, expectedMessage: string) {
    expect(this.error!.message).to.equal(expectedMessage);
  },
);

Then(
  "the error meta should have {string} equal to {string}",
  function (this: ErrorHandlingWorld, key: string, value: string) {
    expect(this.error!.meta).to.have.property(key, value);
  },
);

Then(
  "the error should have status code {int}",
  function (this: ErrorHandlingWorld, statusCode: number) {
    expect(this.error!.statusCode).to.equal(statusCode);
  },
);

Then(
  "the error meta should contain field errors",
  function (this: ErrorHandlingWorld) {
    expect(this.error!.meta).to.have.property("fields");
    expect(this.error!.meta!.fields).to.be.an("object");
  },
);

Then(
  "the field {string} error should be {string}",
  function (this: ErrorHandlingWorld, field: string, errorMessage: string) {
    expect(this.error!.meta!.fields).to.have.property(field, errorMessage);
  },
);

Then(
  "the JSON should have {string} equal to {string}",
  function (this: ErrorHandlingWorld, property: string, value: string) {
    expect(this.errorJson![property]).to.equal(value);
  },
);

Then(
  "the JSON should have {string} equal to {int}",
  function (this: ErrorHandlingWorld, property: string, value: number) {
    expect(this.errorJson![property]).to.equal(value);
  },
);

Then(
  "the JSON should have property {string}",
  function (this: ErrorHandlingWorld, property: string) {
    expect(this.errorJson).to.have.property(property);
  },
);
