Feature: Package Exports
  As a developer
  I want to import configurations in multiple ways
  So that I can choose the most convenient method for my use case

  Background:
    Given I have installed "@deepracticex/configurer"
    Scenario: Import all configs from main entry
      When I import from "@deepracticex/configurer"
      Then I should be able to access eslint configs
      And I should be able to access prettier configs
      And I should be able to access typescript configs
      And I should be able to access all other configs
    Scenario Outline: Import specific config module
      When I import from "@deepracticex/configurer/<module>"
      Then I should only load the "<module>" configuration
      And the import should be type-safe

      Examples:
        | module     |
        | eslint     |
        | prettier   |
        | typescript |
        | commitlint |
        | vitest     |
        | tsup       |
    Scenario: Import in ESM project
      Given my project uses ES modules
      When I import from "@deepracticex/configurer"
      Then the import should work correctly

    Scenario: Import in CommonJS project
      Given my project uses CommonJS
      When I require from "@deepracticex/configurer"
      Then the require should work correctly
