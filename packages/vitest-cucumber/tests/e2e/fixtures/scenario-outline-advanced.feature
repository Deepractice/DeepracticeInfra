Feature: Advanced Scenario Outline
  Testing advanced scenario outline with multiple examples and operations

  Scenario Outline: Calculate with different operators
    Given I have numbers <a> and <b>
    When I <operation> them
    Then the result should be <result>

    Examples:
      | a | b | operation | result |
      | 5 | 3 | add       | 8      |
      | 5 | 3 | subtract  | 2      |
      | 5 | 3 | multiply  | 15     |
      | 6 | 2 | divide    | 3      |
