Feature: Vitest Plugin Integration
  As a developer using Vitest
  I want to run Cucumber feature files as native Vitest tests
  So that I can use BDD without manually generating test files

  Background:
    Given I have a Vitest project with vitest-cucumber plugin configured
    And I have created a features directory

  Rule: Plugin should automatically discover and transform feature files

    Scenario: Transform single feature file to Vitest test
      Given I have a feature file "features/math.feature" with:
        """
        Feature: Math Operations
          Scenario: Add two numbers
            Given I have numbers 2 and 3
            When I add them together
            Then the result should be 5
        """
      And I have step definitions for math operations
      When I run "vitest run"
      Then Vitest should discover 1 test file
      And the test should be named "Math Operations > Add two numbers"
      And all tests should pass

    Scenario: Transform feature with multiple scenarios
      Given I have a feature file "features/calculator.feature" with:
        """
        Feature: Calculator
          Scenario: Addition
            Given I have a calculator
            When I add 2 and 3
            Then the result should be 5

          Scenario: Subtraction
            Given I have a calculator
            When I subtract 2 from 5
            Then the result should be 3
        """
      And I have step definitions for calculator operations
      When I run "vitest run"
      Then Vitest should execute 2 independent tests
      And each scenario should run as a separate it() block
      And all tests should pass

    Scenario: Transform feature with Scenario Outline
      Given I have a feature file "features/parameterized.feature" with:
        """
        Feature: Parameterized Tests
          Scenario Outline: Add numbers
            Given I have numbers <a> and <b>
            When I add them together
            Then the result should be <sum>

            Examples:
              | a | b | sum |
              | 1 | 2 | 3   |
              | 5 | 5 | 10  |
              | 0 | 0 | 0   |
        """
      And I have step definitions for math operations
      When I run "vitest run"
      Then Vitest should execute 3 independent tests
      And each example should run as a separate it() block
      And test names should include example parameters
      And all tests should pass

  Rule: Plugin should support Background and Rule structures

    Scenario: Transform feature with Background
      Given I have a feature file "features/with-background.feature" with:
        """
        Feature: With Background
          Background:
            Given I have initialized the system
            And I have logged in as admin

          Scenario: Create user
            When I create a new user
            Then the user should exist

          Scenario: Delete user
            When I delete a user
            Then the user should not exist
        """
      And I have step definitions for user operations
      When I run "vitest run"
      Then the Background steps should run before each scenario
      And both scenarios should have the initialized system state
      And all tests should pass

    Scenario: Transform feature with Rules
      Given I have a feature file "features/with-rules.feature" with:
        """
        Feature: With Rules
          Rule: Validation rules
            Scenario: Valid input
              When I provide valid input
              Then it should be accepted

          Rule: Business rules
            Scenario: Business logic
              When I execute business logic
              Then it should succeed
        """
      And I have step definitions for validation and business logic
      When I run "vitest run"
      Then Vitest should organize tests by Rule
      And test names should include the Rule name
      And all tests should pass

  Rule: Plugin should integrate seamlessly with Vitest features

    Scenario: Support Vitest watch mode
      Given I have a feature file "features/watch.feature"
      And I have step definitions
      When I run "vitest watch" in background
      And I modify the feature file
      Then Vitest should automatically re-run the affected tests
      And the test results should update

    Scenario: Support Vitest filtering
      Given I have multiple feature files
      When I run "vitest run features/specific.feature"
      Then only tests from "specific.feature" should execute
      And other feature files should be ignored

    Scenario: Support Vitest UI
      Given I have feature files with scenarios
      When I run "vitest --ui"
      Then the Vitest UI should display feature files
      And I should be able to navigate scenarios
      And I should be able to run individual scenarios

  Rule: Plugin should provide clear error messages

    Scenario: Report missing step definitions
      Given I have a feature file "features/incomplete.feature" with:
        """
        Feature: Incomplete
          Scenario: Missing steps
            Given I have a defined step
            When I call an undefined step
            Then something happens
        """
      And I only have step definition for "I have a defined step"
      When I run "vitest run"
      Then the test should fail with clear error message
      And the error should indicate which steps are undefined
      And the error should show the feature file location

    Scenario: Report step execution errors
      Given I have a feature file "features/failing.feature" with:
        """
        Feature: Failing Test
          Scenario: Step throws error
            Given I have a step that throws error
            Then something happens
        """
      And the step definition throws an error
      When I run "vitest run"
      Then the test should fail
      And the error message should include the step text
      And the error should show the feature file line number
      And the stack trace should be meaningful

    Scenario: Report Gherkin syntax errors
      Given I have a feature file "features/invalid.feature" with invalid Gherkin syntax
      When I run "vitest run"
      Then Vitest should fail with a parse error
      And the error should indicate the syntax issue
      And the error should show the file and line number

# Linked to: Plugin architecture design
# Business Rule: Each scenario becomes an independent it() test
# Business Rule: Background runs via beforeEach hook
# Business Rule: Plugin uses Vite's resolveId and load hooks
# Technical Note: Feature files are transformed to executable Vitest code at load time
