Feature: Add Package to Monorepo
  As a developer working in a NodeSpec monorepo
  I want to add new packages to my monorepo
  So that I can extend functionality with properly configured TypeScript packages

  Background:
    Given I am in a NodeSpec monorepo root directory
    And the monorepo has been initialized

  Rule: Add package creates standard TypeScript library structure

    Scenario: Add basic package to packages/ directory
      Given I am in the monorepo root
      When I run "nodespec infra package add my-lib"
      Then the command should succeed
      And the following files should exist:
        | file                           |
        | packages/my-lib/package.json   |
        | packages/my-lib/tsconfig.json  |
        | packages/my-lib/tsup.config.ts |
        | packages/my-lib/src/index.ts   |
      And "packages/my-lib/package.json" should contain "my-lib"
      And "packages/my-lib/package.json" should contain "\"type\": \"module\""
      And "packages/my-lib/tsconfig.json" should contain "@deepracticex/typescript-config"

    Scenario: Add scoped package
      Given I am in the monorepo root
      When I run "nodespec infra package add @myorg/utils"
      Then the command should succeed
      And directory "packages/utils" should exist
      And "packages/utils/package.json" should contain "@myorg/utils"

    Scenario: Package includes TypeScript build configuration
      Given I am in the monorepo root
      When I run "nodespec infra package add my-lib"
      Then the command should succeed
      And "packages/my-lib/package.json" should contain "\"build\": \"tsup\""
      And "packages/my-lib/package.json" should contain "\"typecheck\": \"tsc --noEmit\""
      And "packages/my-lib/tsup.config.ts" should contain "createConfig"
      And "packages/my-lib/tsup.config.ts" should contain "@deepracticex/tsup-config"

    Scenario: Package includes proper exports configuration
      Given I am in the monorepo root
      When I run "nodespec infra package add my-lib"
      Then the command should succeed
      And "packages/my-lib/package.json" should contain "\"main\": \"./dist/index.js\""
      And "packages/my-lib/package.json" should contain "\"types\": \"./dist/index.d.ts\""

    Scenario: Generated package is buildable
      Given I am in the monorepo root
      When I run "nodespec infra package add my-lib"
      And I run "pnpm install"
      And I run "pnpm --filter my-lib run build"
      Then the command should succeed
      And file "packages/my-lib/dist/index.js" should exist
      And file "packages/my-lib/dist/index.d.ts" should exist

  Rule: Validation prevents conflicts and errors

    Scenario: Prevent adding package that already exists
      Given I am in the monorepo root
      And package "existing-lib" already exists in "packages/"
      When I run "nodespec infra package add existing-lib"
      Then the command should fail
      And I should see error message "Package already exists"

    Scenario: Prevent adding package outside monorepo
      Given I am in a non-monorepo directory
      When I run "nodespec infra package add my-lib"
      Then the command should fail
      And I should see error message "Not in a monorepo"

    Scenario: Validate package name format
      Given I am in the monorepo root
      When I run "nodespec infra package add Invalid-Name"
      Then the command should fail
      And I should see error message "Invalid package name"

  Rule: Package location is customizable

    Scenario: Add package to custom location
      Given I am in the monorepo root
      When I run "nodespec infra package add my-lib --location src"
      Then the command should succeed
      And directory "src/my-lib" should exist
      And "src/my-lib/package.json" should contain "my-lib"

# Linked to: Issue #13 (Package/App management)
# Business Rule: Packages are added to packages/ directory by default
# Business Rule: Scoped packages use unscoped directory name
# Business Rule: Generated packages must be buildable without additional configuration
# Business Rule: Package names must follow npm naming conventions
