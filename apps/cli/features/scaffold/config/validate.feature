Feature: Validate Configuration Files
  As a developer working in a NodeSpec monorepo
  I want to validate configuration files
  So that I can ensure all development tools are properly configured

  Background:
    Given I am in a NodeSpec monorepo root directory
    And the monorepo has been initialized

  Rule: Validate all configuration files

    Scenario: Validate all configs
      Given I am in the monorepo root
      And all config files exist with valid configuration
      When I run "nodespec scaffold config validate"
      Then the command should succeed
      And I should see message "All configuration files are valid"
      And I should see validation summary:
        | config           | status |
        | ESLint           | ✓      |
        | Prettier         | ✓      |
        | TypeScript       | ✓      |
        | EditorConfig     | ✓      |

    Scenario: Validate specific tool config
      Given I am in the monorepo root
      And ".eslintrc.json" exists with valid configuration
      When I run "nodespec scaffold config validate --tool eslint"
      Then the command should succeed
      And I should see message "ESLint configuration is valid"

  Rule: Detect configuration issues

    Scenario: Check for conflicting settings
      Given I am in the monorepo root
      And ".eslintrc.json" has "semi: true"
      And ".prettierrc.json" has "semi: false"
      When I run "nodespec scaffold config validate"
      Then the command should fail
      And I should see error message "Conflicting settings detected between ESLint and Prettier"
      And I should see conflict details:
        | setting | ESLint | Prettier |
        | semi    | true   | false    |

    Scenario: Verify TypeScript config compatibility
      Given I am in the monorepo root
      And "tsconfig.json" has invalid "compilerOptions"
      When I run "nodespec scaffold config validate"
      Then the command should fail
      And I should see error message "Invalid TypeScript configuration"
      And I should see recommended settings

  Rule: Validate workspace references

    Scenario: Check workspace references are valid
      Given I am in the monorepo root
      And "tsconfig.json" has references to non-existent packages
      When I run "nodespec scaffold config validate"
      Then the command should fail
      And I should see error message "Invalid TypeScript references: some referenced packages do not exist"

    Scenario: Validate ESLint extends packages exist
      Given I am in the monorepo root
      And ".eslintrc.json" extends "@myorg/eslint-config"
      And package "@myorg/eslint-config" is not installed
      When I run "nodespec scaffold config validate"
      Then the command should fail
      And I should see error message "ESLint configuration extends missing package: @myorg/eslint-config"

  Rule: Provide actionable recommendations

    Scenario: Provide fix suggestions for common issues
      Given I am in the monorepo root
      And ".eslintrc.json" has conflicting settings with Prettier
      When I run "nodespec scaffold config validate"
      Then the command should fail
      And I should see recommendation "Use eslint-config-prettier to resolve conflicts"
      And I should see command suggestion "pnpm add -D eslint-config-prettier"

# Linked to: Issue #12 (Configuration management)
# Business Rule: Validation checks all config files for correctness
# Business Rule: Detects conflicts between different tools (ESLint vs Prettier)
# Business Rule: Verifies TypeScript config references valid workspace packages
# Business Rule: Provides actionable recommendations for fixing issues
# Business Rule: Exits with error code if any validation fails
