Feature: List Configuration Files
  As a developer working in a NodeSpec monorepo
  I want to list all configuration files in my monorepo
  So that I can see what development tools are configured

  Background:
    Given I am in a NodeSpec monorepo root directory
    And the monorepo has been initialized

  Rule: List all configuration files

    Scenario: List all config files
      Given I am in the monorepo root
      And the following config files exist:
        | file              | tool       |
        | .eslintrc.json    | ESLint     |
        | .prettierrc.json  | Prettier   |
        | .editorconfig     | EditorConfig |
        | tsconfig.json     | TypeScript |
      When I run "nodespec infra config list"
      Then the command should succeed
      And I should see configuration files listed:
        | file              | tool       | status |
        | .eslintrc.json    | ESLint     | ✓      |
        | .prettierrc.json  | Prettier   | ✓      |
        | .editorconfig     | EditorConfig | ✓    |
        | tsconfig.json     | TypeScript | ✓      |

    Scenario: Show which tool each config belongs to
      Given I am in the monorepo root
      And file ".eslintrc.json" exists
      When I run "nodespec infra config list"
      Then the command should succeed
      And I should see ".eslintrc.json" mapped to tool "ESLint"

  Rule: Show configuration status

    Scenario: Show if config is standard or customized
      Given I am in the monorepo root
      And ".eslintrc.json" extends "@deepracticex/eslint-config"
      And ".prettierrc.json" contains custom rules
      When I run "nodespec infra config list"
      Then the command should succeed
      And I should see ".eslintrc.json" marked as "Standard"
      And I should see ".prettierrc.json" marked as "Customized"

    @skip
    Scenario: Detect missing recommended configs
      Given I am in the monorepo root
      And file ".eslintrc.json" exists
      And file ".prettierrc.json" does not exist
      When I run "nodespec infra config list"
      Then the command should succeed
      And I should see missing configs:
        | file              | tool     | status  |
        | .prettierrc.json  | Prettier | Missing |
      And I should see suggestion "Run 'nodespec infra config init' to add missing configs"

# Linked to: Issue #13 (Configuration management)
# Business Rule: List shows all recognized configuration files
# Business Rule: Indicates whether configs use standard or custom settings
# Business Rule: Highlights missing recommended configurations
# Business Rule: Maps config files to their corresponding tools
