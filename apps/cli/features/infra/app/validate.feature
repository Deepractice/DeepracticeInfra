Feature: Validate App Structure
  As a developer working in a NodeSpec monorepo
  I want to validate app structure and configuration
  So that I can ensure apps meet NodeSpec standards and are executable

  Background:
    Given I am in a NodeSpec monorepo root directory
    And the monorepo has been initialized

  Rule: Validate ensures app meets standards

    Scenario: Validate single app by name
      Given I am in the monorepo root
      And app "admin-cli" exists in "apps/" with valid structure
      When I run "nodespec infra app validate admin-cli"
      Then the command should succeed
      And I should see message "App admin-cli is valid"

    Scenario: Validate all apps in workspace
      Given I am in the monorepo root
      And app "admin-cli" exists in "apps/" with valid structure
      And app "api-server" exists in "apps/" with valid structure
      When I run "nodespec infra app validate --all"
      Then the command should succeed
      And I should see message "All apps are valid (2 apps checked)"

  Rule: Validation detects structural issues

    Scenario: Detect missing required files
      Given I am in the monorepo root
      And app "broken-cli" exists in "apps/"
      And "apps/broken-cli/tsconfig.json" does not exist
      When I run "nodespec infra app validate broken-cli"
      Then the command should fail
      And I should see error message "Missing required file: tsconfig.json"

    Scenario: Validate package.json structure
      Given I am in the monorepo root
      And app "invalid-cli" exists in "apps/"
      And "apps/invalid-cli/package.json" is missing "bin" field
      When I run "nodespec infra app validate invalid-cli"
      Then the command should fail
      And I should see error message "Missing required field in package.json: bin"

  Rule: Validation checks executable configuration

    Scenario: Validate executable configuration
      Given I am in the monorepo root
      And app "invalid-cli" exists in "apps/"
      And "apps/invalid-cli/package.json" has "bin" field pointing to non-existent file
      When I run "nodespec infra app validate invalid-cli"
      Then the command should fail
      And I should see error message "Invalid bin configuration: file does not exist"

    Scenario: Validate all apps and report all errors
      Given I am in the monorepo root
      And app "valid-cli" exists in "apps/" with valid structure
      And app "broken-cli" exists in "apps/" with missing bin configuration
      When I run "nodespec infra app validate --all"
      Then the command should fail
      And I should see validation summary:
        | status | count |
        | valid  | 1     |
        | errors | 1     |
      And I should see error for "broken-cli"

# Linked to: Issue #13 (Package/App management)
# Business Rule: All apps must have package.json, tsconfig.json, src/index.ts
# Business Rule: package.json must have bin field with valid executable path
# Business Rule: TypeScript config must extend @deepracticex/typescript-config
# Business Rule: Validation exits with error code if any app is invalid
