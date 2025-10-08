Feature: Result Pattern
  As a developer
  I want to use the Result pattern for functional error handling
  So that I can handle errors explicitly without try-catch

  Background:
    Given I have the Result utilities imported

  Rule: Creating Results

    Scenario: Create successful result
      When I create an ok result with value "42"
      Then the result should have ok equal to true
      And the result value should be "42"

    Scenario: Create error result
      When I create an err result with a NotFoundError
      Then the result should have ok equal to false
      And the result error should be a NotFoundError

  Rule: Type Guards

    Scenario: Check if result is Ok
      Given I have an ok result with value "success"
      When I check if the result is ok
      Then the check should return true

    Scenario: Check if result is Err
      Given I have an err result with an error
      When I check if the result is err
      Then the check should return true

  Rule: Unwrapping Results

    Scenario: Unwrap successful result
      Given I have an ok result with value "hello"
      When I unwrap the result
      Then I should get the value "hello"

    Scenario: Unwrap failed result throws error
      Given I have an err result with a NotFoundError
      When I try to unwrap the result
      Then it should throw the error

    Scenario: Unwrap with default value
      Given I have an err result with an error
      When I unwrap the result with default value "fallback"
      Then I should get the value "fallback"

  Rule: Mapping Results

    Scenario: Map successful result
      Given I have an ok result with value "5"
      When I map the result to double the value
      Then the result should be ok with value "10"

    Scenario: Map failed result
      Given I have an err result with an error
      When I map the result to double the value
      Then the result should still be err
      And the error should be preserved

  Rule: Chaining Results

    Scenario: FlatMap successful results
      Given I have an ok result with value "user-123"
      When I flatMap the result to fetch user details
      Then the result should be ok with user data

    Scenario: FlatMap with intermediate error
      Given I have an ok result with value "invalid-id"
      When I flatMap the result to fetch user details
      Then the result should be err
      And the error should be a NotFoundError

  Rule: Real-world usage example

    Scenario: Validate and process user input
      Given I have user input data:
        | field | value           |
        | email | user@example.com |
        | age   | 25              |
      When I validate the input using Result pattern
      And I process the validated data
      Then the final result should be ok
      And the result should contain processed user data

    Scenario: Handle validation failure
      Given I have user input data:
        | field | value      |
        | email | invalid    |
        | age   | 15         |
      When I validate the input using Result pattern
      Then the result should be err
      And the error should be a ValidationError
      And the error should contain field errors
