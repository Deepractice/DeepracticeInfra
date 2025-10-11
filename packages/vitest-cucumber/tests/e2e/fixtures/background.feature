Feature: With Background
  Background:
    Given I have initialized the system
    And I have logged in as admin

  Scenario: Create user
    When I create a new user
    Then the user should exist

  Scenario: Delete user
    When I delete a user
    Then the user should not exist
