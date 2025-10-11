Feature: Cucumber Features Demo
  As a developer
  I want to test all native Cucumber features
  So that I can verify the vitest-cucumber plugin works correctly

  Background:
    Given I have initialized the test environment

  Rule: DataTable Support

    Scenario: Use DataTable with rowsHash
      When I create a configuration with:
        | apiUrl    | https://api.example.com |
        | timeout   | 5000                    |
        | retries   | 3                       |
      Then the configuration should be loaded
      And the API URL should be "https://api.example.com"

    Scenario: Use DataTable with hashes
      When I create multiple users:
        | name  | email             | role  |
        | Alice | alice@example.com | admin |
        | Bob   | bob@example.com   | user  |
      Then I should have 2 users
      And user "Alice" should have role "admin"

  Rule: Parameter Types

    Scenario: Integer parameters
      Given I have 10 items
      When I add 5 more items
      Then I should have 15 items total

    Scenario: Float parameters
      Given the price is 19.99 dollars
      When I apply a 10% discount
      Then the final price should be 17.99 dollars

    Scenario: String parameters
      Given I have a message "Hello World"
      Then the message should contain "Hello"

  Rule: DocString Support

    Scenario: Multi-line content
      When I create a JSON configuration:
        """json
        {
          "name": "test-app",
          "version": "1.0.0",
          "features": ["logging", "monitoring"]
        }
        """
      Then the configuration should be valid JSON
      And it should have feature "logging"

  Rule: Scenario Outline

    Scenario Outline: Calculate sum
      Given I have numbers <a> and <b>
      When I calculate their sum
      Then the result should be <sum>

      Examples:
        | a  | b  | sum |
        | 1  | 2  | 3   |
        | 5  | 5  | 10  |
        | 10 | 20 | 30  |
