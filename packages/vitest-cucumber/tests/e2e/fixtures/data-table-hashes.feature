Feature: DataTable hashes method

  Scenario: Convert table to array of objects
    When I create users:
      | name     | email           |
      | John Doe | john@test.com   |
      | Jane Doe | jane@test.com   |
    Then I should have 2 users
    And the first user should have name "John Doe"
    And the second user should have name "Jane Doe"
