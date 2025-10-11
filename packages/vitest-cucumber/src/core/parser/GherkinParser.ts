import * as Gherkin from "@cucumber/gherkin";
import * as Messages from "@cucumber/messages";

/**
 * Wrapper around @cucumber/gherkin parser
 */
export class GherkinParser {
  /**
   * Parse Gherkin text into AST
   * Creates fresh parser instances for each parse to avoid state pollution
   */
  public parse(content: string): Messages.GherkinDocument {
    try {
      // Create fresh instances for each parse to avoid state pollution
      // This is necessary because the parser and builder maintain internal state
      const uuidFn = Messages.IdGenerator.uuid();
      const builder = new Gherkin.AstBuilder(uuidFn);
      const matcher = new Gherkin.GherkinClassicTokenMatcher();
      const parser = new Gherkin.Parser(builder, matcher);

      const gherkinDocument = parser.parse(content);
      return gherkinDocument;
    } catch (error) {
      throw new Error(
        `Failed to parse Gherkin: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
