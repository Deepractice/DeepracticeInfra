Feature: Advanced Background
  Testing that background steps run before each scenario

  Background:
    Given the calculator is initialized
    And the display is cleared

  Scenario: First calculation
    When I add 2 and 3
    Then the result should be 5

  Scenario: Second calculation
    When I multiply 4 and 5
    Then the result should be 20

  Scenario: Third calculation
    When I subtract 10 from 15
    Then the result should be 5
