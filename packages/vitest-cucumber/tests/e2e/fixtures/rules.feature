Feature: With Rules
  Rule: Validation rules
    Scenario: Valid input
      When I provide valid input
      Then it should be accepted

  Rule: Business rules
    Scenario: Business logic
      When I execute business logic
      Then it should succeed
