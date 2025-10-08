/**
 * Caller location tracking utility
 */
import path from "path";

export interface CallerInfo {
  package: string;
  file: string;
  line: number;
}

/**
 * Get caller information from stack trace
 */
export function getCallerInfo(packageName: string): CallerInfo {
  const stack = new Error().stack || "";
  const stackLines = stack.split("\n");

  // Find first non-logger stack frame
  for (let i = 2; i < stackLines.length; i++) {
    const line = stackLines[i];
    if (
      line &&
      !line.includes("node_modules/pino") &&
      !line.includes("packages/logger") &&
      !line.includes("@deepracticex/logger")
    ) {
      const match = line.match(/at\s+(?:.*?\s+)?\(?(.*?):(\d+):(\d+)\)?/);
      if (match && match[1] && match[2]) {
        const fullPath = match[1];
        const lineNum = parseInt(match[2], 10);
        const filename = path.basename(fullPath);

        return {
          package: packageName,
          file: filename,
          line: lineNum,
        };
      }
    }
  }

  return { package: packageName, file: "unknown", line: 0 };
}
