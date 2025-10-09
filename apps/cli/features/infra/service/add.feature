Feature: Add Service to Monorepo
  As a developer working in a NodeSpec monorepo
  I want to add new services to my monorepo
  So that I can create backend services with proper server configuration

  Background:
    Given I am in a NodeSpec monorepo root directory
    And the monorepo has been initialized

  Rule: Add service creates standard backend service structure

    Scenario: Add basic service to services/ directory
      Given I am in the monorepo root
      When I run "nodespec infra service add api-gateway"
      Then the command should succeed
      And the following files should exist:
        | file                                  |
        | services/api-gateway/package.json     |
        | services/api-gateway/tsconfig.json    |
        | services/api-gateway/tsup.config.ts   |
        | services/api-gateway/src/index.ts     |
        | services/api-gateway/src/server.ts    |
      And "services/api-gateway/package.json" should contain "api-gateway"
      And "services/api-gateway/package.json" should contain "\"type\": \"module\""

    Scenario: Add scoped service
      Given I am in the monorepo root
      When I run "nodespec infra service add @myorg/auth-service"
      Then the command should succeed
      And directory "services/auth-service" should exist
      And "services/auth-service/package.json" should contain "@myorg/auth-service"

  Rule: Service includes server configuration

    Scenario: Service includes server configuration
      Given I am in the monorepo root
      When I run "nodespec infra service add api-gateway"
      Then the command should succeed
      And "services/api-gateway/src/server.ts" should contain server setup
      And "services/api-gateway/package.json" should contain "\"start\": \"node dist/index.js\""
      And "services/api-gateway/package.json" should contain "\"dev\": \"tsx watch src/index.ts\""

    Scenario: Service includes API structure
      Given I am in the monorepo root
      When I run "nodespec infra service add api-gateway"
      Then the command should succeed
      And the following directories should exist:
        | directory                              |
        | services/api-gateway/src/routes        |
        | services/api-gateway/src/middleware    |
        | services/api-gateway/src/controllers   |
      And file "services/api-gateway/src/routes/index.ts" should exist

  Rule: Generated service is buildable and runnable

    Scenario: Generated service is buildable and runnable
      Given I am in the monorepo root
      When I run "nodespec infra service add api-gateway"
      And I run "pnpm install"
      And I run "pnpm --filter api-gateway run build"
      Then the command should succeed
      And file "services/api-gateway/dist/index.js" should exist
      And file "services/api-gateway/dist/server.js" should exist

    Scenario: Service includes environment configuration
      Given I am in the monorepo root
      When I run "nodespec infra service add api-gateway"
      Then the command should succeed
      And file "services/api-gateway/.env.example" should exist
      And "services/api-gateway/.env.example" should contain "PORT=3000"

  Rule: Validation prevents conflicts and errors

    Scenario: Prevent adding existing service
      Given I am in the monorepo root
      And service "existing-api" already exists in "services/"
      When I run "nodespec infra service add existing-api"
      Then the command should fail
      And I should see error message "Service already exists"

    Scenario: Prevent adding service outside monorepo
      Given I am in a non-monorepo directory
      When I run "nodespec infra service add api-gateway"
      Then the command should fail
      And I should see error message "Not in a monorepo"

    Scenario: Validate service name format
      Given I am in the monorepo root
      When I run "nodespec infra service add Invalid-Name"
      Then the command should fail
      And I should see error message "Invalid service name"

# Linked to: Issue #13 (Package/App management)
# Business Rule: Services are added to services/ directory by default
# Business Rule: Services include server setup and API structure
# Business Rule: Generated services must be buildable and runnable
# Business Rule: Service names must follow npm naming conventions
