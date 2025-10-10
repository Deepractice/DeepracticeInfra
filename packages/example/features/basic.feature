Feature: Basic Example Functionality
  As a developer
  I want to use the Example API
  So that I can process data consistently

  Rule: Example should process input correctly

    Scenario: Process simple text
      Given I have created an Example instance
      When I execute with input "hello"
      Then the result should be "Processed: hello"

    Scenario: Get status of active instance
      Given I have created an Example instance with enabled: true
      When I check the status
      Then the status should be "active"

  Rule: Example should respect configuration

    Scenario: Disabled instance should reject processing
      Given I have created an Example instance with enabled: false
      When I execute with input "test"
      Then it should throw an error "Processor is disabled"

    Scenario: Debug mode should log output
      Given I have created an Example instance with debug: true
      When I execute with input "debug-test"
      Then it should log the processing message
