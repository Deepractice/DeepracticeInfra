Feature: Remove Service from Monorepo
  As a developer working in a NodeSpec monorepo
  I want to remove services from my monorepo
  So that I can clean up unused or deprecated backend services safely

  Background:
    Given I am in a NodeSpec monorepo root directory
    And the monorepo has been initialized
    And service "test-api" exists in "services/"

  Rule: Remove service requires confirmation for safety

    Scenario: Remove service with --force flag
      Given I am in the monorepo root
      When I run "nodespec scaffold service remove test-api --force"
      Then the command should succeed
      And directory "services/test-api" should not exist
      And I should see message "Service test-api removed successfully"

    Scenario: Remove service with force flag (duplicate check)
      Given I am in the monorepo root
      When I run "nodespec scaffold service remove test-api --force"
      Then the command should succeed
      And directory "services/test-api" should not exist
      And I should see message "Service test-api removed successfully"

  Rule: Validation prevents errors

    Scenario: Fail if service doesn't exist
      Given I am in the monorepo root
      When I run "nodespec scaffold service remove non-existent --force"
      Then the command should fail
      And I should see error message "Service non-existent not found"

  Rule: Workspace is updated after removal

    Scenario: Update workspace after removal
      Given I am in the monorepo root
      And "pnpm-workspace.yaml" contains "services/*"
      When I run "nodespec scaffold service remove test-api --force"
      Then the command should succeed
      And I run "pnpm install"
      Then the command should succeed
      And "test-api" should not appear in workspace packages

    Scenario: Remove scoped service
      Given I am in the monorepo root
      And service "@myorg/auth-api" exists in "services/auth-api"
      When I run "nodespec scaffold service remove @myorg/auth-api --force"
      Then the command should succeed
      And directory "services/auth-api" should not exist

# Linked to: Issue #11 (Package/App management)
# Business Rule: Service removal requires confirmation unless --force is used
# Business Rule: Workspace is updated after removal to maintain consistency
