Feature: DataTable rowsHash method

  Scenario: Convert table to key-value object
    When I create a user with:
      | name  | John Doe      |
      | email | john@test.com |
    Then the user should have name "John Doe"
    And the user should have email "john@test.com"
