/**
 * Parameter types supported by Cucumber expressions
 */
export enum ParameterType {
  INT = "int",
  FLOAT = "float",
  STRING = "string",
  WORD = "word",
}

/**
 * Information about a captured parameter
 */
export interface ParameterInfo {
  type: ParameterType;
  index: number;
}

/**
 * Converts Cucumber expression parameters to appropriate JavaScript types
 */
export class ParameterTypeConverter {
  /**
   * Regex pattern to match Cucumber expressions like {int}, {float}, {string}, {word}
   */
  private static readonly CUCUMBER_EXPRESSION_PATTERN =
    /\{(int|float|string|word)\}/g;

  /**
   * Extract parameter types from a pattern
   * Supports both RegExp and Cucumber expression strings
   */
  public static extractParameterTypes(
    pattern: string | RegExp,
  ): ParameterInfo[] {
    const parameterInfos: ParameterInfo[] = [];

    if (typeof pattern === "string") {
      // Parse Cucumber expressions like "I have {int} cucumbers"
      let match: RegExpExecArray | null;
      let index = 0;

      const regex = new RegExp(this.CUCUMBER_EXPRESSION_PATTERN);

      while ((match = regex.exec(pattern)) !== null) {
        const type = match[1] as ParameterType;
        parameterInfos.push({ type, index });
        index++;
      }
    }
    // For RegExp patterns, we cannot determine types, treat as strings
    // Users can use explicit type conversion in their step functions

    return parameterInfos;
  }

  /**
   * Convert a captured string value based on parameter type
   */
  public static convert(value: string, type: ParameterType): any {
    switch (type) {
      case ParameterType.INT:
        return parseInt(value, 10);

      case ParameterType.FLOAT:
        return parseFloat(value);

      case ParameterType.STRING:
        // Remove surrounding quotes if present and unescape
        return this.unescapeString(value);

      case ParameterType.WORD:
      default:
        // Keep as-is
        return value;
    }
  }

  /**
   * Remove quotes and unescape string
   */
  private static unescapeString(value: string): string {
    let result = value;

    // Remove surrounding quotes if present
    if (
      (result.startsWith('"') && result.endsWith('"')) ||
      (result.startsWith("'") && result.endsWith("'"))
    ) {
      result = result.slice(1, -1);
    }

    // Unescape common escape sequences
    result = result
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, "\\");

    return result;
  }

  /**
   * Convert Cucumber expression to RegExp
   * Example: "I have {int} cucumbers" -> /^I have (-?\d+) cucumbers$/
   */
  public static cucumberExpressionToRegex(expression: string): RegExp {
    let pattern = expression;

    // Escape special regex characters except {}
    pattern = pattern.replace(/[.*+?^$()[\]\\|]/g, "\\$&");

    // Replace Cucumber expressions with appropriate regex patterns
    pattern = pattern.replace(/\{int\}/g, "(-?\\d+)");
    pattern = pattern.replace(/\{float\}/g, "(-?\\d+\\.?\\d*)");
    pattern = pattern.replace(/\{string\}/g, "(?:\"([^\"]*)\"|'([^']*)')");
    pattern = pattern.replace(/\{word\}/g, "(\\S+)");

    // Anchor the pattern
    return new RegExp(`^${pattern}$`);
  }
}
