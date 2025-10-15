/**
 * Logger adapter factory - auto-detect environment and create appropriate logger
 */
import type { LoggerConfig, RuntimeEnvironment } from "~/types/config.js";

/**
 * Detect the current runtime environment
 */
export function detectEnvironment(): RuntimeEnvironment {
  // Priority 0: Check for test environment (vitest, jest, etc.)
  // Test environments should use in-memory test adapter
  if (
    typeof process !== "undefined" &&
    (process.env.VITEST === "true" ||
      process.env.JEST_WORKER_ID !== undefined ||
      process.env.NODE_ENV === "test")
  ) {
    return "test";
  }

  // Priority 1: Check for Cloudflare Workers specific globals
  // Workers have caches API - this is the most reliable indicator
  // If these globals exist, it's definitely Cloudflare Workers runtime
  if (
    typeof globalThis !== "undefined" &&
    "caches" in globalThis &&
    "Request" in globalThis &&
    "Response" in globalThis
  ) {
    // Presence of Workers globals is sufficient - return immediately
    // Don't check fs/process as they're unreliable in wrangler dev with nodejs_compat
    return "cloudflare-workers";
  }

  // Priority 2: Check for Node.js
  if (
    typeof process !== "undefined" &&
    process.versions &&
    process.versions.node
  ) {
    return "nodejs";
  }

  // Fallback to browser
  return "browser";
}

/**
 * Create appropriate logger adapter based on environment
 *
 * Uses dynamic import() to conditionally load adapters based on runtime.
 * Tree-shaking in production builds ensures unused adapters are removed.
 */
export async function createLoggerAdapter(
  config: LoggerConfig = {},
): Promise<any> {
  const env = config.environment || detectEnvironment();

  if (env === "test") {
    // Test adapter for vitest/jest - in-memory, silent by default
    const { createTestLogger } = await import("./test-adapter.js");
    return createTestLogger(config);
  } else if (env === "nodejs") {
    // Use string concatenation to hide import from bundler static analysis
    // This prevents edge runtime bundlers from including Node.js-only dependencies
    const adapterPath = "./pino-adapter" + ".js";
    const { createPinoLogger } = await import(/* @vite-ignore */ adapterPath);
    return createPinoLogger(config);
  } else {
    // Console adapter is safe for all environments
    const { createConsoleLogger } = await import("./console-adapter.js");
    return createConsoleLogger(config);
  }
}
