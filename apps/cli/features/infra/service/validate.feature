Feature: Validate Service Structure
  As a developer working in a NodeSpec monorepo
  I want to validate service structure and configuration
  So that I can ensure services meet NodeSpec standards and are production-ready

  Background:
    Given I am in a NodeSpec monorepo root directory
    And the monorepo has been initialized

  Rule: Validate ensures service meets standards

    Scenario: Validate single service by name
      Given I am in the monorepo root
      And service "api-gateway" exists in "services/" with valid structure
      When I run "nodespec infra service validate api-gateway"
      Then the command should succeed
      And I should see message "Service api-gateway is valid"

    Scenario: Validate all services in workspace
      Given I am in the monorepo root
      And service "api-gateway" exists in "services/" with valid structure
      And service "auth-service" exists in "services/" with valid structure
      When I run "nodespec infra service validate --all"
      Then the command should succeed
      And I should see message "All services are valid (2 services checked)"

  Rule: Validation detects structural issues

    Scenario: Detect missing required files
      Given I am in the monorepo root
      And service "broken-api" exists in "services/"
      And "services/broken-api/src/server.ts" does not exist
      When I run "nodespec infra service validate broken-api"
      Then the command should fail
      And I should see error message "Missing required file: src/server.ts"

    Scenario: Validate service configuration
      Given I am in the monorepo root
      And service "invalid-api" exists in "services/"
      And "services/invalid-api/package.json" is missing "start" script
      When I run "nodespec infra service validate invalid-api"
      Then the command should fail
      And I should see error message "Missing required script in package.json: start"

  Rule: Validation checks server setup

    Scenario: Validate server setup
      Given I am in the monorepo root
      And service "invalid-api" exists in "services/"
      And "services/invalid-api/src/server.ts" does not export server
      When I run "nodespec infra service validate invalid-api"
      Then the command should fail
      And I should see error message "Invalid server configuration: must export server instance"

    Scenario: Validate all services and report all errors
      Given I am in the monorepo root
      And service "valid-api" exists in "services/" with valid structure
      And service "broken-api" exists in "services/" with missing server setup
      When I run "nodespec infra service validate --all"
      Then the command should fail
      And I should see validation summary:
        | status | count |
        | valid  | 1     |
        | errors | 1     |
      And I should see error for "broken-api"

# Linked to: Issue #13 (Package/App management)
# Business Rule: All services must have package.json, tsconfig.json, src/index.ts, src/server.ts
# Business Rule: package.json must have start and dev scripts
# Business Rule: server.ts must export a proper server instance
# Business Rule: Validation exits with error code if any service is invalid
