Feature: Validate Monorepo Structure
  As a developer working in a NodeSpec monorepo
  I want to validate the entire monorepo structure and configuration
  So that I can ensure the monorepo meets all NodeSpec standards

  Background:
    Given I am in a NodeSpec monorepo root directory

  Rule: Validate ensures complete monorepo structure

    Scenario: Validate complete monorepo structure
      Given the monorepo has been initialized with valid structure
      When I run "nodespec infra monorepo validate"
      Then the command should succeed
      And I should see message "Monorepo structure is valid"
      And I should see validation summary showing:
        | component         | status |
        | Directory structure | ✓    |
        | Required files      | ✓    |
        | Workspace config    | ✓    |
        | TypeScript config   | ✓    |

  Rule: Validation detects missing files

    Scenario: Detect missing required files
      Given the monorepo is initialized
      And file "package.json" does not exist
      When I run "nodespec infra monorepo validate"
      Then the command should fail
      And I should see error message "Missing required file: package.json"

    Scenario: Detect missing workspace configuration
      Given the monorepo is initialized
      And file "pnpm-workspace.yaml" does not exist
      When I run "nodespec infra monorepo validate"
      Then the command should fail
      And I should see error message "Missing required file: pnpm-workspace.yaml"

  Rule: Validation detects missing directories

    Scenario: Detect missing workspace directories
      Given the monorepo is initialized
      And directory "packages/" does not exist
      When I run "nodespec infra monorepo validate"
      Then the command should fail
      And I should see error message "Missing required directory: packages/"

    Scenario: Detect multiple missing directories
      Given the monorepo is initialized
      And directory "packages/" does not exist
      And directory "apps/" does not exist
      When I run "nodespec infra monorepo validate"
      Then the command should fail
      And I should see all error messages:
        | error                                  |
        | Missing required directory: packages/  |
        | Missing required directory: apps/      |

  Rule: Validation checks configuration files

    Scenario: Validate pnpm-workspace.yaml structure
      Given the monorepo is initialized
      And "pnpm-workspace.yaml" does not contain "packages/*"
      When I run "nodespec infra monorepo validate"
      Then the command should fail
      And I should see error message "Invalid pnpm-workspace.yaml: missing packages/* in workspace"

    Scenario: Validate tsconfig.json configuration
      Given the monorepo is initialized
      And "tsconfig.json" does not have "references" field
      When I run "nodespec infra monorepo validate"
      Then the command should fail
      And I should see error message "Invalid tsconfig.json: missing workspace references"

  Rule: Report all validation errors

    Scenario: Report all validation errors
      Given the monorepo is partially initialized
      And file "pnpm-workspace.yaml" does not exist
      And directory "packages/" does not exist
      And "tsconfig.json" is invalid
      When I run "nodespec infra monorepo validate"
      Then the command should fail
      And I should see validation summary showing:
        | component           | status | errors |
        | Directory structure | ✗      | 1      |
        | Required files      | ✗      | 1      |
        | Configuration       | ✗      | 1      |
      And I should see all errors listed

    Scenario: Exit code indicates validation status
      Given the monorepo has validation errors
      When I run "nodespec infra monorepo validate"
      Then the command should exit with code 1
      And the error output should contain validation errors

# Linked to: Issue #8 (Monorepo management)
# Business Rule: Monorepo must have package.json, pnpm-workspace.yaml, tsconfig.json
# Business Rule: Required directories: packages/, apps/
# Business Rule: pnpm-workspace.yaml must include all workspace patterns
# Business Rule: Validation exits with code 0 if valid, code 1 if errors found
