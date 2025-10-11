Feature: Incomplete
  Scenario: Missing steps
    Given I have a defined step
    When I call an undefined step
    Then something happens
