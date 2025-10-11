Feature: Calculator
  Scenario: Addition
    Given I have a calculator
    When I add 2 and 3
    Then the result should be 5

  Scenario: Subtraction
    Given I have a calculator
    When I subtract 2 from 5
    Then the result should be 3
