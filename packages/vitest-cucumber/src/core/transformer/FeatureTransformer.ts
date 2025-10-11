import { FeatureParser } from "~/core/parser";
import { CodeGenerator } from "./CodeGenerator";

/**
 * Main transformation orchestrator
 */
export class FeatureTransformer {
  private parser: FeatureParser;
  private generator: CodeGenerator;

  constructor() {
    this.parser = new FeatureParser();
    this.generator = new CodeGenerator();
  }

  /**
   * Transform feature file content to test code
   */
  public transform(content: string): string {
    // Parse feature file
    const feature = this.parser.parse(content);

    // Generate test code
    const code = this.generator.generate(feature);

    return code;
  }
}
