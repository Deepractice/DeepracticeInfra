Feature: TypeScript Configuration
  As a developer
  I want to use pre-configured TypeScript settings
  So that I can maintain consistent TypeScript compilation across projects

  Background:
    Given I have installed "@deepracticex/config-preset"

  Scenario: Use base TypeScript config
    When I extend typescript.base in my tsconfig.json
    Then the config should target "ES2022"
    And the config should use "ESNext" module system
    And the config should enable strict mode
    And the config should enable declaration generation
    And the config should use Node resolution
