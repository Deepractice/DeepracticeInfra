Feature: List Services in Monorepo
  As a developer working in a NodeSpec monorepo
  I want to list all services in my monorepo
  So that I can see what backend services are available and their details

  Background:
    Given I am in a NodeSpec monorepo root directory
    And the monorepo has been initialized

  Rule: List command shows service information

    Scenario: List all services with names and versions
      Given I am in the monorepo root
      And service "api-gateway" exists in "services/" with version "1.0.0"
      And service "auth-service" exists in "services/" with version "2.1.0"
      When I run "nodespec infra service list"
      Then the command should succeed
      And I should see output containing:
        | service      | version |
        | api-gateway  | 1.0.0   |
        | auth-service | 2.1.0   |

    Scenario: List with detailed information (--verbose)
      Given I am in the monorepo root
      And service "api-gateway" exists in "services/"
      When I run "nodespec infra service list --verbose"
      Then the command should succeed
      And I should see service "api-gateway" with details:
        | field    | value                      |
        | name     | api-gateway                |
        | version  | 0.0.1                      |
        | location | services/api-gateway       |
        | start    | node dist/index.js         |
        | dev      | tsx watch src/index.ts     |

    Scenario: List in JSON format (--json)
      Given I am in the monorepo root
      And service "api-gateway" exists in "services/" with version "1.0.0"
      When I run "nodespec infra service list --json"
      Then the command should succeed
      And the output should be valid JSON
      And the JSON should contain service "api-gateway" with version "1.0.0"

  Rule: Handle empty workspace gracefully

    Scenario: Handle empty services/ directory
      Given I am in the monorepo root
      And "services/" directory is empty
      When I run "nodespec infra service list"
      Then the command should succeed
      And I should see message "No services found"

    Scenario: List scoped services
      Given I am in the monorepo root
      And service "@myorg/api-gateway" exists in "services/api-gateway"
      When I run "nodespec infra service list"
      Then the command should succeed
      And I should see service "@myorg/api-gateway" with location "services/api-gateway"

# Linked to: Issue #13 (Package/App management)
# Business Rule: List shows all services in workspace
# Business Rule: Supports human-readable and machine-readable (JSON) formats
# Business Rule: Verbose mode shows detailed service configuration including server scripts
