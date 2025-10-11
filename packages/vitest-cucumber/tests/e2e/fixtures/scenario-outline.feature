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
