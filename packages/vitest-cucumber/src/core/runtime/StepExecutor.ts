import type { Step, StepContext } from "~/types";
import { StepRegistry } from "./StepRegistry";

/**
 * Executes steps and extracts parameters
 */
export class StepExecutor {
  private registry: StepRegistry;
  private context: StepContext;

  constructor(context: StepContext) {
    this.registry = StepRegistry.getInstance();
    this.context = context;
  }

  /**
   * Execute a step
   */
  public async execute(step: Step): Promise<void> {
    const keyword = step.keyword.trim() as any;
    const match = this.registry.findMatch(keyword, step.text);

    if (!match) {
      throw new Error(
        `No step definition found for: ${step.keyword}${step.text}`,
      );
    }

    const args = this.extractArguments(match.matches, step);
    await match.step.fn.apply(this.context, args);
  }

  /**
   * Extract arguments from regex matches and step data
   */
  private extractArguments(
    matches: RegExpMatchArray | null,
    step: Step,
  ): any[] {
    const args: any[] = [];

    // Add captured groups from regex
    if (matches) {
      // Skip the first element (full match) and add captured groups
      for (let i = 1; i < matches.length; i++) {
        args.push(matches[i]);
      }
    }

    // Add data table if present
    if (step.dataTable) {
      args.push(step.dataTable);
    }

    // Add doc string if present
    if (step.docString) {
      args.push(step.docString);
    }

    return args;
  }
}
