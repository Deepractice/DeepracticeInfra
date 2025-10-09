Feature: Remove App from Monorepo
  As a developer working in a NodeSpec monorepo
  I want to remove apps from my monorepo
  So that I can clean up unused or deprecated applications safely

  Background:
    Given I am in a NodeSpec monorepo root directory
    And the monorepo has been initialized
    And app "test-cli" exists in "apps/"

  Rule: Remove app requires confirmation for safety

    Scenario: Remove app with --force flag
      Given I am in the monorepo root
      When I run "nodespec scaffold app remove test-cli --force"
      Then the command should succeed
      And directory "apps/test-cli" should not exist
      And I should see message "App test-cli removed successfully"

    Scenario: Remove app with force flag (duplicate check)
      Given I am in the monorepo root
      When I run "nodespec scaffold app remove test-cli --force"
      Then the command should succeed
      And directory "apps/test-cli" should not exist
      And I should see message "App test-cli removed successfully"

  Rule: Validation prevents errors

    Scenario: Fail if app doesn't exist
      Given I am in the monorepo root
      When I run "nodespec scaffold app remove non-existent --force"
      Then the command should fail
      And I should see error message "App non-existent not found"

  Rule: Workspace is updated after removal

    Scenario: Update workspace after removal
      Given I am in the monorepo root
      And "pnpm-workspace.yaml" contains "apps/*"
      When I run "nodespec scaffold app remove test-cli --force"
      Then the command should succeed
      And I run "pnpm install"
      Then the command should succeed
      And "test-cli" should not appear in workspace packages

    Scenario: Remove scoped app
      Given I am in the monorepo root
      And app "@myorg/admin-cli" exists in "apps/admin-cli"
      When I run "nodespec scaffold app remove @myorg/admin-cli --force"
      Then the command should succeed
      And directory "apps/admin-cli" should not exist

# Linked to: Issue #11 (Package/App management)
# Business Rule: App removal requires confirmation unless --force is used
# Business Rule: Workspace is updated after removal to maintain consistency
