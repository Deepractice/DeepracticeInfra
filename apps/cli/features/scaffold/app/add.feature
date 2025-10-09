Feature: Add Application to Monorepo
  As a developer working in a NodeSpec monorepo
  I want to add new applications to my monorepo
  So that I can create executable Node.js applications with proper configuration

  Background:
    Given I am in a NodeSpec monorepo root directory
    And the monorepo has been initialized

  Rule: Add app creates executable application structure

    Scenario: Add basic CLI application
      Given I am in the monorepo root
      When I run "nodespec scaffold app add my-cli"
      Then the command should succeed
      And the following files should exist:
        | file                          |
        | apps/my-cli/package.json      |
        | apps/my-cli/tsconfig.json     |
        | apps/my-cli/tsup.config.ts    |
        | apps/my-cli/src/index.ts      |
        | apps/my-cli/src/cli.ts        |
      And "apps/my-cli/package.json" should contain "my-cli"
      And "apps/my-cli/package.json" should contain "\"type\": \"module\""
      And "apps/my-cli/package.json" should contain "\"bin\""

    Scenario: Add scoped application
      Given I am in the monorepo root
      When I run "nodespec scaffold app add @myorg/my-app"
      Then the command should succeed
      And directory "apps/my-app" should exist
      And "apps/my-app/package.json" should contain "@myorg/my-app"

    Scenario: Application includes executable configuration
      Given I am in the monorepo root
      When I run "nodespec scaffold app add my-cli"
      Then the command should succeed
      And "apps/my-cli/package.json" should contain "\"bin\": {"
      And "apps/my-cli/src/cli.ts" should contain "#!/usr/bin/env node"
      And "apps/my-cli/src/index.ts" should contain "export"

    Scenario: Application includes build and dev scripts
      Given I am in the monorepo root
      When I run "nodespec scaffold app add my-cli"
      Then the command should succeed
      And "apps/my-cli/package.json" should contain "\"build\": \"tsup\""
      And "apps/my-cli/package.json" should contain "\"dev\""
      And "apps/my-cli/package.json" should contain "\"typecheck\": \"tsc --noEmit\""

    Scenario: Generated application is buildable and executable
      Given I am in the monorepo root
      When I run "nodespec scaffold app add my-cli"
      And I run "pnpm install"
      And I run "pnpm build --filter my-cli"
      Then the command should succeed
      And file "apps/my-cli/dist/index.js" should exist
      And file "apps/my-cli/dist/cli.js" should exist
      And file "apps/my-cli/dist/cli.js" should be executable

  Rule: Validation prevents conflicts and errors

    Scenario: Prevent adding app that already exists
      Given I am in the monorepo root
      And app "existing-app" already exists in "apps/"
      When I run "nodespec scaffold app add existing-app"
      Then the command should fail
      And I should see error message "App already exists"

    Scenario: Prevent adding app outside monorepo
      Given I am in a non-monorepo directory
      When I run "nodespec scaffold app add my-app"
      Then the command should fail
      And I should see error message "Not in a monorepo"

    Scenario: Validate app name format
      Given I am in the monorepo root
      When I run "nodespec scaffold app add Invalid-Name"
      Then the command should fail
      And I should see error message "Invalid app name"

# Linked to: Issue #11 (Package/App management)
# Business Rule: Apps are added to apps/ directory by default
# Business Rule: Apps must include bin configuration for executability
# Business Rule: Generated apps must be buildable and executable without additional configuration
# Business Rule: App names must follow npm naming conventions
