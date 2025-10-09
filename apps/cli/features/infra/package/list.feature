Feature: List Packages in Monorepo
  As a developer working in a NodeSpec monorepo
  I want to list all packages in my monorepo
  So that I can see what packages are available and their details

  Background:
    Given I am in a NodeSpec monorepo root directory
    And the monorepo has been initialized

  Rule: List command shows package information

    Scenario: List all packages with names and versions
      Given I am in the monorepo root
      And package "core-lib" exists in "packages/" with version "1.0.0"
      And package "utils" exists in "packages/" with version "2.1.0"
      When I run "nodespec infra package list"
      Then the command should succeed
      And I should see output containing:
        | package  | version |
        | core-lib | 1.0.0   |
        | utils    | 2.1.0   |

    Scenario: List with detailed information (--verbose)
      Given I am in the monorepo root
      And package "core-lib" exists in "packages/"
      When I run "nodespec infra package list --verbose"
      Then the command should succeed
      And I should see package "core-lib" with details:
        | field       | value                    |
        | name        | core-lib                 |
        | version     | 1.0.0                    |
        | location    | packages/core-lib        |
        | main        | ./dist/index.js          |
        | types       | ./dist/index.d.ts        |

    Scenario: List in JSON format (--json)
      Given I am in the monorepo root
      And package "core-lib" exists in "packages/" with version "1.0.0"
      When I run "nodespec infra package list --json"
      Then the command should succeed
      And the output should be valid JSON
      And the JSON should contain package "core-lib" with version "1.0.0"

  Rule: List shows package locations

    Scenario: Show package locations
      Given I am in the monorepo root
      And package "core-lib" exists in "packages/"
      And package "custom-lib" exists in "src/"
      When I run "nodespec infra package list"
      Then the command should succeed
      And I should see "core-lib" with location "packages/core-lib"
      And I should see "custom-lib" with location "src/custom-lib"

    Scenario: List scoped packages
      Given I am in the monorepo root
      And package "@myorg/utils" exists in "packages/utils"
      When I run "nodespec infra package list"
      Then the command should succeed
      And I should see package "@myorg/utils" with location "packages/utils"

  Rule: Handle empty workspace gracefully

    Scenario: Handle empty packages/ directory
      Given I am in the monorepo root
      And "packages/" directory is empty
      When I run "nodespec infra package list"
      Then the command should succeed
      And I should see message "No packages found"

# Linked to: Issue #13 (Package/App management)
# Business Rule: List shows all packages in workspace
# Business Rule: Supports human-readable and machine-readable (JSON) formats
# Business Rule: Verbose mode shows detailed package configuration
