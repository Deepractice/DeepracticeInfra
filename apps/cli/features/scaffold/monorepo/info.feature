Feature: Display Monorepo Information
  As a developer working in a NodeSpec monorepo
  I want to display comprehensive monorepo information
  So that I can quickly understand the monorepo structure and configuration

  Background:
    Given I am in a NodeSpec monorepo root directory
    And the monorepo has been initialized

  Rule: Display essential project information

    Scenario: Display project name and version
      Given I am in the monorepo root
      And "package.json" contains name "my-monorepo" and version "1.0.0"
      When I run "nodespec scaffold monorepo info"
      Then the command should succeed
      And I should see output containing:
        | field   | value        |
        | Name    | my-monorepo  |
        | Version | 1.0.0        |

    Scenario: Show workspace package count
      Given I am in the monorepo root
      And 3 packages exist in "packages/"
      And 2 apps exist in "apps/"
      When I run "nodespec scaffold monorepo info"
      Then the command should succeed
      And I should see "Total packages: 5"
      And I should see workspace summary:
        | type     | count |
        | Packages | 3     |
        | Apps     | 2     |

  Rule: Display workspace directories with item counts

    Scenario: List workspace directories with item counts
      Given I am in the monorepo root
      And 3 packages exist in "packages/"
      And 2 apps exist in "apps/"
      And 1 service exists in "services/"
      When I run "nodespec scaffold monorepo info"
      Then the command should succeed
      And I should see workspace directories:
        | directory | count |
        | packages  | 3     |
        | apps      | 2     |
        | services  | 1     |

    Scenario: Show empty workspace directories
      Given I am in the monorepo root
      And "packages/" directory is empty
      And 2 apps exist in "apps/"
      When I run "nodespec scaffold monorepo info"
      Then the command should succeed
      And I should see "packages: 0"
      And I should see "apps: 2"

  Rule: Display TypeScript and build tool configuration

    Scenario: Show TypeScript and build tool configuration
      Given I am in the monorepo root
      When I run "nodespec scaffold monorepo info"
      Then the command should succeed
      And I should see configuration summary:
        | tool       | status |
        | TypeScript | ✓      |
        | pnpm       | ✓      |
        | tsup       | ✓      |

    Scenario: Show detailed configuration with --verbose flag
      Given I am in the monorepo root
      When I run "nodespec scaffold monorepo info --verbose"
      Then the command should succeed
      And I should see detailed configuration:
        | tool           | version | config file           |
        | TypeScript     | 5.x     | tsconfig.json         |
        | pnpm workspace | 8.x     | pnpm-workspace.yaml   |

  Rule: Handle non-monorepo directories gracefully

    Scenario: Handle non-monorepo directories gracefully
      Given I am in a non-monorepo directory
      When I run "nodespec scaffold monorepo info"
      Then the command should fail
      And I should see error message "Not in a NodeSpec monorepo"
      And I should see suggestion "Use 'nodespec scaffold monorepo init' to initialize"

# Linked to: Issue #8 (Monorepo management)
# Business Rule: Info displays project metadata, workspace structure, and tooling
# Business Rule: Shows count of packages, apps, and services
# Business Rule: Verbose mode includes version numbers and config file paths
# Business Rule: Provides helpful guidance when not in a monorepo
