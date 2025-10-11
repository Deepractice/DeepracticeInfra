Feature: Prettier Configuration
  As a developer
  I want to use pre-configured Prettier settings
  So that I can maintain consistent code formatting across projects

  Background:
    Given I have installed "@deepracticex/configurer"
    Scenario: Use default Prettier config
      When I import prettier.base from the package
      Then the config should have semi set to true
      And the config should have singleQuote set to false
      And the config should have tabWidth set to 2
      And the config should have printWidth set to 80
      And the config should have trailingComma set to "es5"
    Scenario: Export as Prettier config
      When I export prettier.base as my prettier config
      Then Prettier should be able to parse the config
      And Prettier should format code correctly
