Feature: Step Definition Management
  As a developer
  I want to write step definitions that work seamlessly with the plugin
  So that I can implement test logic efficiently

  Background:
    Given I have vitest-cucumber plugin configured
    And I have a features directory

  Rule: Plugin should support standard Cucumber expression syntax

    Scenario: Use string parameters
      Given I have a step definition:
        """
        import { Given, When, Then } from '@deepracticex/vitest-cucumber';

        Given('I have installed {string}', function(packageName: string) {
          this.package = packageName;
        });
        """
      And I have a feature with step "Given I have installed \"@deepracticex/logger\""
      When I run "vitest run"
      Then the step should receive "@deepracticex/logger" as parameter
      And the parameter should be typed as string
      And the test should pass

    Scenario: Use int parameters
      Given I have a step definition:
        """
        When('I add {int} and {int}', function(a: number, b: number) {
          this.result = a + b;
        });
        """
      And I have a feature with step "When I add 2 and 3"
      When I run "vitest run"
      Then the step should receive 2 and 3 as numbers
      And the parameters should be typed as number
      And the test should pass

    Scenario: Use float parameters
      Given I have a step definition:
        """
        Then('the price should be {float}', function(price: number) {
          expect(this.price).toBe(price);
        });
        """
      And I have a feature with step "Then the price should be 19.99"
      When I run "vitest run"
      Then the step should receive 19.99 as a number
      And the test should pass

    Scenario: Use word parameters
      Given I have a step definition:
        """
        Given('I am logged in as {word}', function(role: string) {
          this.userRole = role;
        });
        """
      And I have a feature with step "Given I am logged in as admin"
      When I run "vitest run"
      Then the step should receive "admin" as parameter
      And the test should pass

  Rule: Plugin should support data tables

    Scenario: Use data table as parameter
      Given I have a step definition:
        """
        When('I create a user with:', function(dataTable: DataTable) {
          this.user = dataTable.rowsHash();
        });
        """
      And I have a feature with:
        """
        When I create a user with:
          | name  | John Doe      |
          | email | john@test.com |
        """
      When I run "vitest run"
      Then the step should receive a DataTable object
      And I should be able to call dataTable.rowsHash()
      And the result should be { name: "John Doe", email: "john@test.com" }
      And the test should pass

    Scenario: Use data table as array
      Given I have a step definition:
        """
        When('I create users:', function(dataTable: DataTable) {
          this.users = dataTable.hashes();
        });
        """
      And I have a feature with:
        """
        When I create users:
          | name     | email           |
          | John Doe | john@test.com   |
          | Jane Doe | jane@test.com   |
        """
      When I run "vitest run"
      Then the step should receive a DataTable object
      And I should be able to call dataTable.hashes()
      And the result should be an array of 2 objects
      And the test should pass

  Rule: Plugin should support doc strings

    Scenario: Use doc string parameter
      Given I have a step definition:
        """
        When('I create file {string} with:', function(filename: string, content: string) {
          this.files[filename] = content;
        });
        """
      And I have a feature with:
        """
        When I create file "package.json" with:
          \"\"\"
          {
            "name": "test-package",
            "version": "1.0.0"
          }
          \"\"\"
        """
      When I run "vitest run"
      Then the step should receive filename and content
      And content should be the JSON string
      And the test should pass

  Rule: Plugin should support async step definitions

    Scenario: Execute async step
      Given I have a step definition:
        """
        When('I fetch data from API', async function() {
          this.data = await fetch('/api/data').then(r => r.json());
        });
        """
      And I have a feature using this step
      When I run "vitest run"
      Then the step should execute asynchronously
      And Vitest should wait for the promise to resolve
      And the test should pass

    Scenario: Handle async step timeout
      Given I have a slow async step that takes 10 seconds
      And I have configured step timeout to 5 seconds
      When I run "vitest run"
      Then the test should timeout
      And the error should indicate timeout exceeded
      And the error should show which step timed out

  Rule: Plugin should support step definition context (this)

    Scenario: Share data between steps via context
      Given I have step definitions:
        """
        Given('I have a value {int}', function(value: number) {
          this.value = value;
        });

        When('I multiply by {int}', function(multiplier: number) {
          this.result = this.value * multiplier;
        });

        Then('the result should be {int}', function(expected: number) {
          expect(this.result).toBe(expected);
        });
        """
      And I have a feature using these steps
      When I run "vitest run"
      Then data should be shared between steps via context
      And each scenario should have isolated context
      And the test should pass

    Scenario: Use typed context interface
      Given I have a context interface:
        """
        interface TestContext {
          calculator: Calculator;
          result?: number;
        }
        """
      And I have step definitions typed with TestContext
      When I run "vitest run"
      Then TypeScript should provide autocomplete for context properties
      And TypeScript should catch context type errors
      And the test should pass

  Rule: Plugin should support hooks in step definitions

    Scenario: Execute Before hook
      Given I have a step definition file with:
        """
        import { Before } from '@deepracticex/vitest-cucumber';

        Before(function() {
          this.testStartTime = Date.now();
        });
        """
      When I run "vitest run"
      Then the Before hook should run before each scenario
      And all scenarios should have testStartTime set
      And the test should pass

    Scenario: Execute After hook
      Given I have a step definition file with:
        """
        import { After } from '@deepracticex/vitest-cucumber';

        After(function() {
          // Cleanup
          this.cleanup();
        });
        """
      When I run "vitest run"
      Then the After hook should run after each scenario
      And cleanup should happen even if scenario fails
      And the test should pass

    Scenario: Execute BeforeAll hook
      Given I have a step definition file with:
        """
        import { BeforeAll } from '@deepracticex/vitest-cucumber';

        BeforeAll(async function() {
          await startTestServer();
        });
        """
      When I run "vitest run"
      Then the BeforeAll hook should run once before all scenarios
      And all scenarios should have access to the test server
      And the test should pass

    Scenario: Execute AfterAll hook
      Given I have a step definition file with:
        """
        import { AfterAll } from '@deepracticex/vitest-cucumber';

        AfterAll(async function() {
          await stopTestServer();
        });
        """
      When I run "vitest run"
      Then the AfterAll hook should run once after all scenarios
      And the test server should be stopped
      And the test should pass

  Rule: Plugin should provide helpful debugging tools

    Scenario: Enable step tracing
      Given I configure the plugin with step tracing enabled
      When I run "vitest run"
      Then the console should show each step as it executes
      And timing information should be displayed
      And I can see the execution flow

    Scenario: Pending step definition
      Given I have a step definition:
        """
        When('I do something complex', function() {
          return 'pending';
        });
        """
      When I run "vitest run"
      Then the test should be marked as pending/skipped
      And the output should indicate the step is not implemented
      And other tests should still run

# Linked to: Step definition API design
# Business Rule: Step definitions should feel natural to Cucumber users
# Business Rule: TypeScript types should be inferred correctly
# Technical Note: Step definitions are registered globally and matched at runtime
