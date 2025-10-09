Feature: Initialize Monorepo in Current Directory
  As a developer using NodeSpec
  I want to initialize a monorepo project in my current directory
  So that I can quickly set up a standardized Node.js monorepo structure

  Background:
    Given I am in a temporary test directory

  Rule: Initialize creates complete monorepo structure in current directory

    Scenario: Initialize project in current directory
      Given I am in an empty directory
      When I run "nodespec infra monorepo init --skip-git --skip-install"
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

    Scenario: Initialize project with custom name
      Given I am in an empty directory
      When I run "nodespec infra monorepo init --name my-awesome-project --skip-git --skip-install"
      Then the command should succeed
      And "package.json" should contain "my-awesome-project"

  Rule: Generate complete src/ directory structure with core and domain packages

    Scenario: Generate src/ structure with core and domain packages
      Given I am in an empty directory
      When I run "nodespec infra monorepo init --skip-git --skip-install"
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
      When I run "nodespec infra monorepo init --skip-git --skip-install"
      Then the command should succeed
      And "src/core/package.json" should contain "\"private\": true"
      And "src/core/package.json" should contain "\"main\": \"./index.ts\""

    Scenario: Verify src/domain package.json structure
      Given I am in an empty directory
      When I run "nodespec infra monorepo init --skip-git --skip-install"
      Then the command should succeed
      And "src/domain/package.json" should contain "\"private\": true"
      And "src/domain/package.json" should contain "\"main\": \"./index.ts\""

    Scenario: Package names follow naming convention
      Given I am in an empty directory
      When I run "nodespec infra monorepo init --skip-git --skip-install"
      Then the command should succeed
      And "src/core/package.json" should contain "-core"
      And "src/domain/package.json" should contain "-domain"

    Scenario: Package names adopt custom project name
      Given I am in an empty directory
      When I run "nodespec infra monorepo init --name my-awesome-app --skip-git --skip-install"
      Then the command should succeed
      And "src/core/package.json" should contain "my-awesome-app-core"
      And "src/domain/package.json" should contain "my-awesome-app-domain"

    Scenario: src/README.md explains architecture philosophy
      Given I am in an empty directory
      When I run "nodespec infra monorepo init --skip-git --skip-install"
      Then the command should succeed
      And "src/README.md" should contain "core"
      And "src/README.md" should contain "domain"

    Scenario: index.ts files contain valid TypeScript
      Given I am in an empty directory
      When I run "nodespec infra monorepo init --skip-git --skip-install"
      Then the command should succeed
      And "src/core/index.ts" should contain "export"
      And "src/domain/index.ts" should contain "export"

  Rule: Validation prevents data loss

    Scenario: Prevent overwriting existing project
      Given I am in a directory with an existing "package.json"
      When I run "nodespec infra monorepo init --skip-git --skip-install"
      Then the command should fail
      And I should see error message "Project already exists"

  Rule: Dependency management is configurable

    Scenario: Auto install dependencies after initialization
      Given I am in an empty directory
      When I run "nodespec infra monorepo init"
      Then the command should succeed
      And "node_modules" directory should exist
      And "pnpm-lock.yaml" should exist

    Scenario: Skip dependency installation with flag
      Given I am in an empty directory
      When I run "nodespec infra monorepo init --skip-install --skip-git"
      Then the command should succeed
      And "node_modules" directory should not exist
      And "pnpm-lock.yaml" should not exist

  Rule: Git initialization is configurable

    Scenario: Initialize with git commit
      Given I am in an empty directory
      When I run "nodespec infra monorepo init --skip-install"
      Then the command should succeed
      And git repository should have initial commit
      And git commit message should contain "Initial commit from NodeSpec"

    Scenario: Skip git initialization with flag
      Given I am in an empty directory
      When I run "nodespec infra monorepo init --skip-git --skip-install"
      Then the command should succeed
      And git repository should not be initialized

# Linked to: Issue #13 (CLI restructure)
# Business Rule: Monorepo init creates standardized pnpm workspace structure
# Business Rule: src/ packages (core, domain) are automatically created
# Business Rule: Validation prevents accidental data loss
