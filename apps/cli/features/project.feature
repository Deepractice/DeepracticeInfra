Feature: Project Management
  As a developer using NodeSpec
  I want to manage monorepo projects
  So that I can quickly bootstrap and maintain standardized Node.js projects

  Background:
    Given I am in a temporary test directory

  Scenario: Initialize project in current directory
    Given I am in an empty directory
    When I run "nodespec project init"
    Then the command should succeed
    And the following files should exist:
      | file                  |
      | package.json          |
      | pnpm-workspace.yaml   |
      | tsconfig.json         |
      | .gitignore            |
      | README.md             |
      | lefthook.yml          |
    And "package.json" should contain "DeepracticeUser"
    And "pnpm-workspace.yaml" should contain "packages/*"
    And "pnpm-workspace.yaml" should contain "src/*"
    And "pnpm-workspace.yaml" should contain "apps/*"
    And "pnpm-workspace.yaml" should contain "services/*"
    And git repository should be initialized
    And the following directories should exist:
      | directory |
      | packages  |
      | src       |
      | apps      |
      | services  |

  Scenario: Initialize project and verify it works end-to-end
    Given I am in an empty directory
    When I run "nodespec project init --skip-git"
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
    And I run "pnpm build" in "packages/test-lib"
    Then the command should succeed

  Scenario: Initialize project with custom name
    Given I am in an empty directory
    When I run "nodespec project init --name my-awesome-project"
    Then the command should succeed
    And "package.json" should contain "my-awesome-project"

  Scenario: Create new project in subdirectory
    Given I am in a test directory
    When I run "nodespec project create my-project"
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
    And git repository should be initialized in "my-project"

  Scenario: Create project with scoped name
    Given I am in a test directory
    When I run "nodespec project create @myorg/myapp"
    Then the command should succeed
    And directory "myapp" should exist
    And "myapp/package.json" should contain "@myorg/myapp"

  Scenario: Prevent overwriting existing project
    Given I am in a directory with an existing "package.json"
    When I run "nodespec project init"
    Then the command should fail
    And I should see error message "Project already exists"

  Scenario: Prevent creating project in existing directory
    Given I am in a test directory
    And directory "existing-project" exists
    When I run "nodespec project create existing-project"
    Then the command should fail
    And I should see error message "Directory already exists"

  Scenario: Auto install dependencies after initialization
    Given I am in an empty directory
    When I run "nodespec project init"
    Then the command should succeed
    And "node_modules" directory should exist
    And "pnpm-lock.yaml" should exist

  Scenario: Skip dependency installation with flag
    Given I am in an empty directory
    When I run "nodespec project init --skip-install"
    Then the command should succeed
    And "node_modules" directory should not exist
    And "pnpm-lock.yaml" should not exist

  Scenario: Initialize with git commit
    Given I am in an empty directory
    When I run "nodespec project init"
    Then the command should succeed
    And git repository should have initial commit
    And git commit message should contain "Initial commit from NodeSpec"

  Scenario: Skip git initialization with flag
    Given I am in an empty directory
    When I run "nodespec project init --skip-git"
    Then the command should succeed
    And git repository should not be initialized

  Scenario: Create project and develop a working package
    Given I am in a test directory
    When I run "nodespec project create my-monorepo --skip-git --skip-install"
    Then the command should succeed
    And directory "my-monorepo" should exist

    # Install dependencies
    When I navigate to "my-monorepo"
    And I run "pnpm install"
    Then the command should succeed

    # Create a library package
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
          "@deepracticex/tsup-config": "workspace:*",
          "@deepracticex/typescript-config": "workspace:*"
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
