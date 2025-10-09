Feature: Remove Package from Monorepo
  As a developer working in a NodeSpec monorepo
  I want to remove packages from my monorepo
  So that I can clean up unused or deprecated packages safely

  Background:
    Given I am in a NodeSpec monorepo root directory
    And the monorepo has been initialized
    And package "test-lib" exists in "packages/"

  Rule: Remove package requires confirmation for safety

    Scenario: Remove package with --force flag
      Given I am in the monorepo root
      When I run "nodespec infra package remove test-lib --force"
      Then the command should succeed
      And directory "packages/test-lib" should not exist
      And I should see message "Package test-lib removed successfully"

    Scenario: Remove package with force flag (duplicate check)
      Given I am in the monorepo root
      When I run "nodespec infra package remove test-lib --force"
      Then the command should succeed
      And directory "packages/test-lib" should not exist
      And I should see message "Package test-lib removed successfully"

  Rule: Validation prevents breaking changes

    Scenario: Fail if package doesn't exist
      Given I am in the monorepo root
      When I run "nodespec infra package remove non-existent --force"
      Then the command should fail
      And I should see error message "Package non-existent not found"

    Scenario: Fail if other packages depend on it
      Given I am in the monorepo root
      And package "core-lib" exists in "packages/"
      And package "dependent-lib" exists in "packages/"
      And "packages/dependent-lib/package.json" contains dependency on "core-lib"
      When I run "nodespec infra package remove core-lib --force"
      Then the command should fail
      And I should see error message "Cannot remove package: 1 package depends on it"
      And I should see message "dependent-lib"

  Rule: Workspace is updated after removal

    Scenario: Update workspace after removal
      Given I am in the monorepo root
      And "pnpm-workspace.yaml" contains "packages/*"
      When I run "nodespec infra package remove test-lib --force"
      Then the command should succeed
      And I run "pnpm install"
      Then the command should succeed
      And "test-lib" should not appear in workspace packages

    Scenario: Remove scoped package
      Given I am in the monorepo root
      And package "@myorg/utils" exists in "packages/utils"
      When I run "nodespec infra package remove @myorg/utils --force"
      Then the command should succeed
      And directory "packages/utils" should not exist

# Linked to: Issue #13 (Package/App management)
# Business Rule: Package removal requires confirmation unless --force is used
# Business Rule: Cannot remove package if other packages depend on it
# Business Rule: Workspace is updated after removal to maintain consistency
