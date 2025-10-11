Feature: Calculator Rules
  Testing Rules with nested scenarios and backgrounds

  Rule: Addition rules
    Background:
      Given the calculator is in addition mode

    Scenario: Add positive numbers
      When I add 5 and 3
      Then the result should be 8

    Scenario: Add negative numbers
      When I add -5 and -3
      Then the result should be -8

  Rule: Multiplication rules
    Background:
      Given the calculator is in multiplication mode

    Scenario: Multiply positive numbers
      When I multiply 5 and 3
      Then the result should be 15

    Scenario: Multiply by zero
      When I multiply 5 and 0
      Then the result should be 0
