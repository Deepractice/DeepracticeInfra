Feature: Project Scaffolding
  As a developer using NodeSpec
  I want to scaffold monorepo projects
  So that I can quickly scaffold standardized Node.js projects

  Background:
    Given I am in a temporary test directory

  Scenario: Initialize project in current directory
    Given I am in an empty directory
    When I run "nodespec scaffold init --skip-git --skip-install"
    Then the command should succeed
    And the following files should exist:
      | file                  |
      | package.json          |
      | pnpm-workspace.yaml   |
      | tsconfig.json         |
      | .gitignore            |
      | README.md             |
      | lefthook.yml          |
      | src/README.md         |
      | src/core/package.json |
      | src/core/index.ts     |
      | src/domain/package.json |
      | src/domain/index.ts   |
    And "package.json" should contain "packageManager"
    And "pnpm-workspace.yaml" should contain "packages/*"
    And "pnpm-workspace.yaml" should contain "src/*"
    And "pnpm-workspace.yaml" should contain "apps/*"
    And "pnpm-workspace.yaml" should contain "services/*"
    And the following directories should exist:
      | directory |
      | packages  |
      | src       |
      | src/core     |
      | src/domain   |
      | apps      |
      | services  |

  Rule: Generate complete src/ directory structure with core and domain packages

    Scenario: Generate src/ structure with core and domain packages
      Given I am in an empty directory
      When I run "nodespec scaffold init --skip-git --skip-install"
      Then the command should succeed
      And the following directories should exist:
        | directory    |
        | src/core     |
        | src/domain   |
      And the following files should exist:
        | file                       |
        | src/README.md              |
        | src/core/package.json      |
        | src/core/index.ts          |
        | src/domain/package.json    |
        | src/domain/index.ts        |

    Scenario: Verify src/core package.json structure
      Given I am in an empty directory
      When I run "nodespec scaffold init --skip-git --skip-install"
      Then the command should succeed
      And "src/core/package.json" should contain "\"private\": true"
      And "src/core/package.json" should contain "\"main\": \"./index.ts\""

    Scenario: Verify src/domain package.json structure
      Given I am in an empty directory
      When I run "nodespec scaffold init --skip-git --skip-install"
      Then the command should succeed
      And "src/domain/package.json" should contain "\"private\": true"
      And "src/domain/package.json" should contain "\"main\": \"./index.ts\""

    Scenario: Package names follow naming convention
      Given I am in an empty directory
      When I run "nodespec scaffold init --skip-git --skip-install"
      Then the command should succeed
      And "src/core/package.json" should contain "-core"
      And "src/domain/package.json" should contain "-domain"

    Scenario: Package names adopt custom project name
      Given I am in an empty directory
      When I run "nodespec scaffold init --name my-awesome-app --skip-git --skip-install"
      Then the command should succeed
      And "src/core/package.json" should contain "my-awesome-app-core"
      And "src/domain/package.json" should contain "my-awesome-app-domain"

    Scenario: src/README.md explains architecture philosophy
      Given I am in an empty directory
      When I run "nodespec scaffold init --skip-git --skip-install"
      Then the command should succeed
      And "src/README.md" should contain "core"
      And "src/README.md" should contain "domain"

    Scenario: index.ts files contain valid TypeScript
      Given I am in an empty directory
      When I run "nodespec scaffold init --skip-git --skip-install"
      Then the command should succeed
      And "src/core/index.ts" should contain "export"
      And "src/domain/index.ts" should contain "export"

  Scenario: Initialize project and verify it works end-to-end
    Given I am in an empty directory
    When I run "nodespec scaffold init --skip-git"
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

  Scenario: Initialize project with custom name
    Given I am in an empty directory
    When I run "nodespec scaffold init --name my-awesome-project --skip-git --skip-install"
    Then the command should succeed
    And "package.json" should contain "my-awesome-project"

  Scenario: Create new project in subdirectory
    Given I am in a test directory
    When I run "nodespec scaffold create my-project --skip-git --skip-install"
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
    When I run "nodespec scaffold create @myorg/myapp --skip-git --skip-install"
    Then the command should succeed
    And directory "myapp" should exist
    And "myapp/package.json" should contain "@myorg/myapp"

  Scenario: Prevent overwriting existing project
    Given I am in a directory with an existing "package.json"
    When I run "nodespec scaffold init --skip-git --skip-install"
    Then the command should fail
    And I should see error message "Project already exists"

  Scenario: Prevent creating project in existing directory
    Given I am in a test directory
    And directory "existing-project" exists
    When I run "nodespec scaffold create existing-project --skip-git --skip-install"
    Then the command should fail
    And I should see error message "Directory already exists"

  Scenario: Auto install dependencies after initialization
    Given I am in an empty directory
    When I run "nodespec scaffold init"
    Then the command should succeed
    And "node_modules" directory should exist
    And "pnpm-lock.yaml" should exist

  Scenario: Skip dependency installation with flag
    Given I am in an empty directory
    When I run "nodespec scaffold init --skip-install --skip-git"
    Then the command should succeed
    And "node_modules" directory should not exist
    And "pnpm-lock.yaml" should not exist

  Scenario: Initialize with git commit
    Given I am in an empty directory
    When I run "nodespec scaffold init --skip-install"
    Then the command should succeed
    And git repository should have initial commit
    And git commit message should contain "Initial commit from NodeSpec"

  Scenario: Skip git initialization with flag
    Given I am in an empty directory
    When I run "nodespec scaffold init --skip-git --skip-install"
    Then the command should succeed
    And git repository should not be initialized

  Scenario: Create project and develop a working package
    Given I am in a test directory
    When I run "nodespec scaffold create my-monorepo --skip-git --skip-install"
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
