Feature: Vitest Configuration
  As a developer
  I want to use pre-configured Vitest settings
  So that I can maintain consistent testing setup across projects

  Background:
    Given I have installed "@deepracticex/configurer"

  Scenario: Use base Vitest config
    When I import vitest.base from the package
    Then the config should enable globals
    And the config should use node environment
    And the config should pass with no tests
    And the config should include unit test files
    And the config should exclude node_modules and dist
