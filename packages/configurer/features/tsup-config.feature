Feature: Tsup Configuration
  As a developer
  I want to use pre-configured Tsup settings
  So that I can maintain consistent build setup across packages

  Background:
    Given I have installed "@deepracticex/configurer"
    Scenario: Use base Tsup config
      When I import tsup.base from the package
      Then the config should output both ESM and CommonJS formats
      And the config should generate TypeScript declarations
      And the config should generate source maps
      And the config should clean output directory before build
      And the config should configure ~ alias to src directory
    Scenario: Create custom Tsup config
      When I use tsup.createConfig with custom options
      Then the custom options should merge with base config
      And the ~ alias should resolve to src directory
      And all base config features should be available
