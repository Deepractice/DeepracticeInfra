Feature: Validate Package Structure
  As a developer working in a NodeSpec monorepo
  I want to validate package structure and configuration
  So that I can ensure packages meet NodeSpec standards

  Background:
    Given I am in a NodeSpec monorepo root directory
    And the monorepo has been initialized

  Rule: Validate ensures package meets standards

    Scenario: Validate single package by name
      Given I am in the monorepo root
      And package "core-lib" exists in "packages/" with valid structure
      When I run "nodespec scaffold package validate core-lib"
      Then the command should succeed
      And I should see message "Package core-lib is valid"

    Scenario: Validate all packages in workspace
      Given I am in the monorepo root
      And package "core-lib" exists in "packages/" with valid structure
      And package "utils" exists in "packages/" with valid structure
      When I run "nodespec scaffold package validate --all"
      Then the command should succeed
      And I should see message "All packages are valid (2 packages checked)"

  Rule: Validation detects structural issues

    Scenario: Detect missing required files
      Given I am in the monorepo root
      And package "broken-lib" exists in "packages/"
      And "packages/broken-lib/tsconfig.json" does not exist
      When I run "nodespec scaffold package validate broken-lib"
      Then the command should fail
      And I should see error message "Missing required file: tsconfig.json"

    Scenario: Validate package.json structure
      Given I am in the monorepo root
      And package "invalid-lib" exists in "packages/"
      And "packages/invalid-lib/package.json" is missing "main" field
      When I run "nodespec scaffold package validate invalid-lib"
      Then the command should fail
      And I should see error message "Missing required field in package.json: main"

    Scenario: Validate TypeScript configuration
      Given I am in the monorepo root
      And package "invalid-ts" exists in "packages/"
      And "packages/invalid-ts/tsconfig.json" does not extend "@deepracticex/typescript-config"
      When I run "nodespec scaffold package validate invalid-ts"
      Then the command should fail
      And I should see error message "Invalid TypeScript configuration: must extend @deepracticex/typescript-config"

  Rule: Report multiple errors in one run

    Scenario: Report all validation errors
      Given I am in the monorepo root
      And package "broken-lib" exists in "packages/"
      And "packages/broken-lib/tsconfig.json" does not exist
      And "packages/broken-lib/package.json" is missing "main" field
      When I run "nodespec scaffold package validate broken-lib"
      Then the command should fail
      And I should see all error messages:
        | error                                      |
        | Missing required file: tsconfig.json       |
        | Missing required field in package.json: main |

    Scenario: Validate all packages and report all errors
      Given I am in the monorepo root
      And package "valid-lib" exists in "packages/" with valid structure
      And package "broken-lib" exists in "packages/" with missing tsconfig.json
      When I run "nodespec scaffold package validate --all"
      Then the command should fail
      And I should see validation summary:
        | status | count |
        | valid  | 1     |
        | errors | 1     |
      And I should see error for "broken-lib"

# Linked to: Issue #11 (Package/App management)
# Business Rule: All packages must have package.json, tsconfig.json, src/index.ts
# Business Rule: TypeScript config must extend @deepracticex/typescript-config
# Business Rule: package.json must have required fields (name, version, main, types)
# Business Rule: Validation exits with error code if any package is invalid
