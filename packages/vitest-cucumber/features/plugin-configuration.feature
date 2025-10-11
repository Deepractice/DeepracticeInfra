Feature: Plugin Configuration
  As a developer
  I want to configure the vitest-cucumber plugin
  So that I can customize its behavior for my project

  Background:
    Given I have a Vitest project

  Rule: Plugin should accept configuration options

    Scenario: Configure feature file pattern
      Given I configure the plugin in "vitest.config.ts" with:
        """
        import { vitestCucumber } from '@deepracticex/vitest-cucumber/plugin';

        export default defineConfig({
          plugins: [
            vitestCucumber({
              featurePattern: 'specs/**/*.feature'
            })
          ]
        });
        """
      And I have feature files in "specs/" directory
      When I run "vitest run"
      Then the plugin should discover features in "specs/" directory
      And features in "features/" should be ignored

    Scenario: Configure step definitions pattern
      Given I configure the plugin with:
        """
        vitestCucumber({
          stepDefinitions: 'tests/steps/**/*.ts'
        })
        """
      And I have step definitions in "tests/steps/" directory
      When I run "vitest run"
      Then the plugin should load step definitions from "tests/steps/"
      And step definitions elsewhere should be ignored

    Scenario: Configure multiple step definition directories
      Given I configure the plugin with:
        """
        vitestCucumber({
          stepDefinitions: [
            'tests/steps/**/*.ts',
            'tests/shared-steps/**/*.ts'
          ]
        })
        """
      When I run "vitest run"
      Then the plugin should load steps from both directories
      And steps should be available to all features

  Rule: Plugin should support Cucumber configuration

    Scenario: Configure custom parameter types
      Given I configure the plugin with:
        """
        vitestCucumber({
          parameterTypes: [
            {
              name: 'status',
              regexp: /active|inactive|pending/,
              transformer: (s) => s as Status
            }
          ]
        })
        """
      And I have a feature using "{status}" parameter
      When I run "vitest run"
      Then the custom parameter type should be available
      And the transformer should be applied
      And all tests should pass

    Scenario: Configure hooks
      Given I configure the plugin with:
        """
        vitestCucumber({
          hooks: {
            beforeAll: async () => {
              await setupTestDatabase();
            },
            afterAll: async () => {
              await cleanupTestDatabase();
            }
          }
        })
        """
      When I run "vitest run"
      Then "beforeAll" hook should run once before all tests
      And "afterAll" hook should run once after all tests
      And all tests should have access to the test database

    Scenario: Configure world context
      Given I configure the plugin with:
        """
        vitestCucumber({
          worldParameters: {
            apiUrl: 'http://localhost:3000',
            timeout: 5000
          }
        })
        """
      And my step definitions access "this.parameters"
      When I run "vitest run"
      Then step definitions should have access to world parameters
      And parameters should be typed correctly
      And all tests should pass

  Rule: Plugin configuration should be validated

    Scenario: Reject invalid feature pattern
      Given I configure the plugin with invalid glob pattern
      When I start Vitest
      Then Vitest should fail to start
      And the error should indicate invalid configuration
      And the error should suggest correct pattern format

    Scenario: Warn about non-existent step directories
      Given I configure step definitions path that does not exist
      When I run "vitest run"
      Then the plugin should emit a warning
      And the warning should indicate missing directory
      And Vitest should still attempt to run tests

  Rule: Plugin should provide sensible defaults

    Scenario: Use default configuration
      Given I configure the plugin without any options:
        """
        vitestCucumber()
        """
      When I run "vitest run"
      Then the plugin should use default feature pattern "**/*.feature"
      And the plugin should use default step pattern "**/*.steps.{ts,js}"
      And all features should be discovered automatically

    Scenario: Override only specific options
      Given I configure the plugin with:
        """
        vitestCucumber({
          featurePattern: 'features/**/*.feature'
          // stepDefinitions uses default
        })
        """
      When I run "vitest run"
      Then the plugin should use custom feature pattern
      And the plugin should use default step definition pattern
      And all features and steps should be discovered

# Linked to: Plugin implementation
# Business Rule: Configuration should be type-safe
# Business Rule: Invalid configuration should fail fast
# Technical Note: Plugin configuration extends Vite plugin options
