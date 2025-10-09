Feature: Initialize Configuration Files
  As a developer working in a NodeSpec monorepo
  I want to initialize standard configuration files
  So that I can set up linting, formatting, and other development tools quickly

  Background:
    Given I am in a NodeSpec monorepo root directory
    And the monorepo has been initialized

  Rule: Initialize creates standard configuration set

    Scenario: Initialize default configuration set
      Given I am in the monorepo root
      When I run "nodespec scaffold config init"
      Then the command should succeed
      And the following config files should exist:
        | file              | tool       |
        | .eslintrc.json    | ESLint     |
        | .prettierrc.json  | Prettier   |
        | .editorconfig     | EditorConfig |
        | .gitignore        | Git        |
      And I should see message "Configuration files initialized successfully"

    Scenario: Initialize with specific preset
      Given I am in the monorepo root
      When I run "nodespec scaffold config init --preset strict"
      Then the command should succeed
      And ".eslintrc.json" should contain strict ESLint rules
      And ".prettierrc.json" should contain strict formatting rules

  Rule: Reinitialize with force flag

    Scenario: Reinitialize existing configuration (--force)
      Given I am in the monorepo root
      And file ".eslintrc.json" already exists
      When I run "nodespec scaffold config init --force"
      Then the command should succeed
      And ".eslintrc.json" should be updated
      And I should see message "Configuration files reinitialized"

    Scenario: Fail to reinitialize without force flag
      Given I am in the monorepo root
      And file ".eslintrc.json" already exists
      When I run "nodespec scaffold config init"
      Then the command should fail
      And I should see error message "Configuration files already exist. Use --force to reinitialize"

  Rule: Selective tool initialization

    Scenario: Skip specific tools (--skip-eslint)
      Given I am in the monorepo root
      When I run "nodespec scaffold config init --skip-eslint"
      Then the command should succeed
      And file ".eslintrc.json" should not exist
      And file ".prettierrc.json" should exist
      And file ".editorconfig" should exist

    Scenario: Skip multiple tools
      Given I am in the monorepo root
      When I run "nodespec scaffold config init --skip-eslint --skip-prettier"
      Then the command should succeed
      And file ".eslintrc.json" should not exist
      And file ".prettierrc.json" should not exist
      And file ".editorconfig" should exist

  Rule: Tool-specific configuration generation

    Scenario: Generate ESLint configuration
      Given I am in the monorepo root
      When I run "nodespec scaffold config init"
      Then the command should succeed
      And ".eslintrc.json" should contain:
        | setting                  | value                          |
        | extends                  | @deepracticex/eslint-config    |
        | parser                   | @typescript-eslint/parser      |

    Scenario: Generate Prettier configuration
      Given I am in the monorepo root
      When I run "nodespec scaffold config init"
      Then the command should succeed
      And ".prettierrc.json" should contain:
        | setting              | value  |
        | semi                 | true   |
        | singleQuote          | true   |
        | trailingComma        | all    |

# Linked to: Issue #12 (Configuration management)
# Business Rule: Default preset includes ESLint, Prettier, EditorConfig, and .gitignore
# Business Rule: Configuration files extend @deepracticex packages where available
# Business Rule: Reinitializing requires --force flag to prevent accidental overwrites
# Business Rule: Individual tools can be skipped with --skip-{tool} flags
