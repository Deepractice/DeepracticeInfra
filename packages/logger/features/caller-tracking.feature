Feature: Caller Location Tracking
  As a developer
  I want to see where log messages come from
  So that I can quickly locate the source of logs

  Background:
    Given I have a logger instance

  Rule: Logger should track caller information

    Scenario: Log with caller location
      When I log a message from a function
      Then the log should include caller location
      And the location should include filename
      And the location should include line number

  Rule: Location format should be readable

    Scenario: Check location format
      When I log "Test message" at level "info"
      Then the log location should match format "[filename:lineNumber]"
