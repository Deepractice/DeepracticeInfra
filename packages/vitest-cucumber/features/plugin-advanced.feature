Feature: Advanced Plugin Features
  As a developer with complex testing needs
  I want advanced features for sophisticated test scenarios
  So that I can handle real-world testing requirements

  Background:
    Given I have vitest-cucumber plugin configured

  Rule: Plugin should support test tagging and filtering

    Scenario: Filter tests by tags
      Given I have a feature with tags:
        """
        @smoke @critical
        Feature: User Authentication

          @fast
          Scenario: Login with valid credentials
            When I login with valid credentials
            Then I should be logged in

          @slow @e2e
          Scenario: Full authentication flow
            When I complete full authentication
            Then I should have full access
        """
      When I run "vitest run --grep @fast"
      Then only the "@fast" scenario should execute
      And the "@slow" scenario should be skipped

    Scenario: Exclude tests by tags
      Given I have features with "@wip" tags
      When I run "vitest run --grep '^(?!.*@wip).*$'"
      Then tests with "@wip" tag should be skipped
      And all other tests should execute

    Scenario: Combine multiple tag filters
      Given I have features with various tags
      When I run "vitest run --grep '@smoke.*@fast'"
      Then only scenarios with both tags should execute

  Rule: Plugin should support parallel execution

    Scenario: Run independent scenarios in parallel
      Given I have 10 feature files with independent scenarios
      When I run "vitest run --threads"
      Then Vitest should execute scenarios in parallel
      And total execution time should be less than serial execution
      And all tests should pass

    Scenario: Handle shared state in parallel tests
      Given I have scenarios that share test database
      When I run "vitest run --threads"
      Then each test worker should have isolated state
      And tests should not interfere with each other
      And all tests should pass

    Scenario: Control parallelism level
      Given I have many feature files
      When I run "vitest run --threads --maxThreads 4"
      Then Vitest should use maximum 4 worker threads
      And tests should execute efficiently

  Rule: Plugin should support custom reporters

    Scenario: Generate Cucumber JSON report
      Given I configure custom reporter:
        """
        vitestCucumber({
          reporters: ['json:cucumber-report.json']
        })
        """
      When I run "vitest run"
      Then a Cucumber-compatible JSON report should be generated
      And the report should include all scenarios
      And the report should include step results

    Scenario: Generate HTML report
      Given I configure HTML reporter
      When I run "vitest run"
      Then an HTML report should be generated
      And the report should be viewable in browser
      And the report should include feature descriptions

    Scenario: Use multiple reporters
      Given I configure multiple reporters
      When I run "vitest run"
      Then all configured reports should be generated
      And each report should be in correct format

  Rule: Plugin should support test retries

    Scenario: Retry flaky test
      Given I have a flaky scenario that fails occasionally
      And I configure retry count to 3
      When I run "vitest run"
      Then Vitest should retry failed scenarios
      And the test should eventually pass
      And retry information should be in the output

    Scenario: Do not retry on specific errors
      Given I have a scenario that fails with validation error
      And I configure to not retry validation errors
      When I run "vitest run"
      Then the scenario should not be retried
      And the test should fail immediately

  Rule: Plugin should support snapshot testing

    Scenario: Compare API response snapshot
      Given I have a step definition with snapshot:
        """
        Then('the API response should match snapshot', function() {
          expect(this.response).toMatchSnapshot();
        });
        """
      And I have a feature using this step
      When I run "vitest run"
      Then Vitest should compare with saved snapshot
      And mismatches should cause test failure

    Scenario: Update snapshots
      Given I have changed API response format
      When I run "vitest run -u"
      Then Vitest should update all snapshots
      And subsequent runs should pass

  Rule: Plugin should support coverage reporting

    Scenario: Generate coverage for step definitions
      Given I have feature files and step definitions
      When I run "vitest run --coverage"
      Then Vitest should generate coverage report
      And the report should include step definition files
      And the report should show which steps are used

    Scenario: Exclude files from coverage
      Given I configure coverage exclusions
      When I run "vitest run --coverage"
      Then excluded files should not be in coverage report
      And coverage percentage should reflect only included files

  Rule: Plugin should support debugging

    Scenario: Debug step execution
      Given I have a failing scenario
      When I run "vitest run --inspect-brk"
      Then Vitest should pause at first step
      And I should be able to attach debugger
      And I should be able to step through code

    Scenario: Use console.log in steps
      Given I have step definitions with console.log
      When I run "vitest run"
      Then console output should be visible in test output
      And output should be associated with correct test

    Scenario: Inspect test context
      Given I want to debug test context
      When I add breakpoint in step definition
      And I run with debugger attached
      Then I should be able to inspect this.* properties
      And I should see all shared state

  Rule: Plugin should support environment variables

    Scenario: Access environment variables in steps
      Given I set environment variable "API_URL=http://test.api"
      And I have step definitions accessing process.env.API_URL
      When I run "vitest run"
      Then step definitions should read the environment variable
      And tests should use the correct API URL

    Scenario: Use .env files
      Given I have a ".env.test" file with configuration
      And I configure plugin to load .env.test
      When I run "vitest run"
      Then environment variables should be loaded
      And step definitions should access the variables

  Rule: Plugin should provide performance monitoring

    Scenario: Report slow steps
      Given I have scenarios with various step execution times
      When I run "vitest run --reporter=verbose"
      Then the output should highlight slow steps
      And I should see timing for each step
      And I can identify performance bottlenecks

    Scenario: Set step timeout thresholds
      Given I configure slow step threshold to 1 second
      When I run "vitest run"
      Then steps taking longer than 1 second should be flagged
      And I should see warnings for slow steps

  Rule: Plugin should support type safety

    Scenario: Type-safe step parameters
      Given I have TypeScript step definitions with typed parameters
      When I compile the test code
      Then TypeScript should verify parameter types
      And incorrect types should cause compilation errors
      And the code should have full IntelliSense support

    Scenario: Type-safe context
      Given I define a typed World interface
      When I write step definitions using this context
      Then TypeScript should provide autocomplete
      And accessing undefined properties should error
      And the code should be type-safe

# Linked to: Advanced plugin capabilities
# Business Rule: Advanced features should be opt-in
# Business Rule: Plugin should leverage Vitest's full feature set
# Technical Note: Integration with Vitest's built-in features
