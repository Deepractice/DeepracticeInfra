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
    And "package.json" should contain "@deepracticex/nodespec"
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
