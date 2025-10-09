Feature: List Apps in Monorepo
  As a developer working in a NodeSpec monorepo
  I want to list all apps in my monorepo
  So that I can see what executable applications are available and their details

  Background:
    Given I am in a NodeSpec monorepo root directory
    And the monorepo has been initialized

  Rule: List command shows app information

    Scenario: List all apps with names and versions
      Given I am in the monorepo root
      And app "admin-cli" exists in "apps/" with version "1.0.0"
      And app "api-server" exists in "apps/" with version "2.1.0"
      When I run "nodespec scaffold app list"
      Then the command should succeed
      And I should see output containing:
        | app        | version |
        | admin-cli  | 1.0.0   |
        | api-server | 2.1.0   |

    Scenario: List with detailed information (--verbose)
      Given I am in the monorepo root
      And app "admin-cli" exists in "apps/"
      When I run "nodespec scaffold app list --verbose"
      Then the command should succeed
      And I should see app "admin-cli" with details:
        | field    | value              |
        | name     | admin-cli          |
        | version  | 1.0.0              |
        | location | apps/admin-cli     |
        | bin      | ./dist/index.js    |

    Scenario: List in JSON format (--json)
      Given I am in the monorepo root
      And app "admin-cli" exists in "apps/" with version "1.0.0"
      When I run "nodespec scaffold app list --json"
      Then the command should succeed
      And the output should be valid JSON
      And the JSON should contain app "admin-cli" with version "1.0.0"

  Rule: Handle empty workspace gracefully

    Scenario: Handle empty apps/ directory
      Given I am in the monorepo root
      And "apps/" directory is empty
      When I run "nodespec scaffold app list"
      Then the command should succeed
      And I should see message "No apps found"

    Scenario: List scoped apps
      Given I am in the monorepo root
      And app "@myorg/admin-cli" exists in "apps/admin-cli"
      When I run "nodespec scaffold app list"
      Then the command should succeed
      And I should see app "@myorg/admin-cli" with location "apps/admin-cli"

# Linked to: Issue #11 (Package/App management)
# Business Rule: List shows all apps in workspace
# Business Rule: Supports human-readable and machine-readable (JSON) formats
# Business Rule: Verbose mode shows detailed app configuration including bin entry
