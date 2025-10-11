Feature: Example Lifecycle Management
  As a developer
  I want to manage Example instance lifecycle
  So that I can properly initialize and clean up resources

  Rule: Example can be created and disposed

    Scenario: Create and dispose Example instance
      Given I have created an Example instance
      When I dispose the instance
      Then the instance should be cleaned up

    Scenario: Create multiple instances independently
      Given I have created an Example instance with enabled: true
      And I have created another Example instance with enabled: false
      When I check the status of first instance
      Then the status should be "active"
      When I check the status of second instance
      Then the status should be "inactive"
