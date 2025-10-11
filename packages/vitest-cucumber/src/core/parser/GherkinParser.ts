import * as Gherkin from "@cucumber/gherkin";
import * as Messages from "@cucumber/messages";

/**
 * Wrapper around @cucumber/gherkin parser
 */
export class GherkinParser {
  private parser: any;
  private builder: any;

  constructor() {
    const uuidFn = Messages.IdGenerator.uuid();
    this.builder = new Gherkin.AstBuilder(uuidFn);
    this.parser = new Gherkin.Parser(this.builder);
  }

  /**
   * Parse Gherkin text into AST
   */
  public parse(content: string): Messages.GherkinDocument {
    try {
      const gherkinDocument = this.parser.parse(content);
      return gherkinDocument;
    } catch (error) {
      throw new Error(
        `Failed to parse Gherkin: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
