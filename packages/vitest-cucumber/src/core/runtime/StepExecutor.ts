import type { Step, StepContext } from "~/types";
import { StepRegistry } from "./StepRegistry";
import { ParameterTypeConverter } from "./ParameterTypeConverter";

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

    const args = this.extractArguments(match.matches, match.step, step);
    await match.step.fn.apply(this.context, args);
  }

  /**
   * Extract arguments from regex matches and step data
   */
  private extractArguments(
    matches: RegExpMatchArray | null,
    stepDef: import("./StepRegistry").ExtendedStepDefinition,
    step: Step,
  ): any[] {
    const args: any[] = [];

    // Add captured groups from regex with type conversion
    if (matches) {
      // Skip the first element (full match) and add captured groups
      for (let i = 1; i < matches.length; i++) {
        const capturedValue = matches[i];

        // Skip undefined captures (can happen with optional groups)
        if (capturedValue === undefined) {
          continue;
        }

        // Find corresponding parameter type
        const paramInfo = stepDef.parameterTypes.find((p) => p.index === i - 1);

        if (paramInfo) {
          // Convert based on parameter type
          args.push(
            ParameterTypeConverter.convert(capturedValue, paramInfo.type),
          );
        } else {
          // No type info, keep as string
          args.push(capturedValue);
        }
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
