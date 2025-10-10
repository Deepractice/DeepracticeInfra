Feature: ESLint Configuration
  As a developer
  I want to use pre-configured ESLint settings
  So that I can maintain consistent code quality across projects

  Background:
    Given I have installed "@deepracticex/configurer"

  Scenario: Use base ESLint config
    When I import eslint.base from the package
    Then the config should include TypeScript support
    And the config should include Prettier integration
    And the config should have recommended rules
    And the config should ignore dist and node_modules

  Scenario: Export as ESLint flat config
    When I export eslint.base as my eslint config
    Then ESLint should be able to parse the config
    And ESLint should apply the rules correctly
