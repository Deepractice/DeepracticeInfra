Feature: Create Monorepo in New Directory
  As a developer using NodeSpec
  I want to create a monorepo project in a new directory
  So that I can start a new project without navigating to the target location first

  Background:
    Given I am in a temporary test directory

  Rule: Create command generates project in new subdirectory

    Scenario: Create new project in subdirectory
      Given I am in a test directory
      When I run "nodespec infra monorepo create my-project --skip-git --skip-install"
      Then the command should succeed
      And directory "my-project" should exist
      And the following files should exist in "my-project":
        | file                  |
        | package.json          |
        | pnpm-workspace.yaml   |
        | tsconfig.json         |
        | .gitignore            |
        | README.md             |
        | lefthook.yml          |
      And "my-project/package.json" should contain "my-project"

    Scenario: Create project with scoped name
      Given I am in a test directory
      When I run "nodespec infra monorepo create @myorg/myapp --skip-git --skip-install"
      Then the command should succeed
      And directory "myapp" should exist
      And "myapp/package.json" should contain "@myorg/myapp"

  Rule: Validation prevents accidental overwrites

    Scenario: Prevent creating project in existing directory
      Given I am in a test directory
      And directory "existing-project" exists
      When I run "nodespec infra monorepo create existing-project --skip-git --skip-install"
      Then the command should fail
      And I should see error message "Directory already exists"

  Rule: Created monorepo is fully functional end-to-end

    Scenario: Initialize project and verify it works end-to-end
      Given I am in an empty directory
      When I run "nodespec infra monorepo init --skip-git"
      Then the command should succeed

      # Verify dependencies can be installed
      When I run "pnpm install"
      Then the command should succeed
      And "node_modules" directory should exist
      And "pnpm-lock.yaml" should exist

      # Verify TypeScript configuration is valid
      When I run "pnpm typecheck"
      Then the command should succeed

      # Verify formatting works
      When I run "pnpm format"
      Then the command should succeed

      # Verify the project structure is valid for building
      When I create a test package in "packages/test-lib"
      And I run "pnpm install"
      And I run "pnpm build" in "packages/test-lib"
      Then the command should succeed

    Scenario: Create project and develop a working package
      Given I am in a test directory
      When I run "nodespec infra monorepo create my-monorepo --skip-git --skip-install"
      Then the command should succeed
      And directory "my-monorepo" should exist

      # Install dependencies
      When I navigate to "my-monorepo"
      And I run "pnpm install"
      Then the command should succeed

      # Create a library package using published deepractice configs
      When I create directory "packages/math-lib"
      And I create "packages/math-lib/package.json" with:
        """
        {
          "name": "@my-monorepo/math-lib",
          "version": "0.0.1",
          "type": "module",
          "main": "./dist/index.js",
          "types": "./dist/index.d.ts",
          "scripts": {
            "build": "tsup",
            "typecheck": "tsc --noEmit"
          },
          "devDependencies": {
            "@deepracticex/tsup-config": "latest",
            "@deepracticex/typescript-config": "latest",
            "tsup": "^8.0.0",
            "typescript": "^5.0.0"
          }
        }
        """
      And I create "packages/math-lib/tsconfig.json" with:
        """
        {
          "extends": "@deepracticex/typescript-config/base.json",
          "compilerOptions": {
            "outDir": "./dist",
            "rootDir": "./src"
          },
          "include": ["src/**/*"]
        }
        """
      And I create "packages/math-lib/tsup.config.ts" with:
        """
        import { createConfig } from '@deepracticex/tsup-config';
        export default createConfig({ entry: ['src/index.ts'] });
        """
      And I create "packages/math-lib/src/index.ts" with:
        """
        export function add(a: number, b: number): number {
          return a + b;
        }
        """

      # Install dependencies for new package
      When I run "pnpm install"
      Then the command should succeed

      # Build the package
      When I run "pnpm build --filter @my-monorepo/math-lib"
      Then the command should succeed
      And file "packages/math-lib/dist/index.js" should exist
      And file "packages/math-lib/dist/index.d.ts" should exist

      # Verify the built package exports correct types
      When I run "pnpm typecheck --filter @my-monorepo/math-lib"
      Then the command should succeed

# Linked to: Issue #13 (CLI restructure)
# Business Rule: Create command generates project in new directory based on project name
# Business Rule: Scoped packages use unscoped name for directory (e.g., @org/pkg -> pkg/)
# Business Rule: Generated monorepo must be fully functional out of the box
