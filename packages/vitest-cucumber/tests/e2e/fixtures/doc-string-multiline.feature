Feature: DocString multiline content

  Scenario: Preserve line breaks
    When I create a note with:
      """
      Line one
      Line two
      Line three
      """
    Then the note should have 3 lines
