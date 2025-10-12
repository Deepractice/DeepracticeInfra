/**
 * @deepracticex/logger
 *
 * Unified logging solution with environment-aware adapters
 * - Pino for Node.js (high performance, structured logging)
 * - Console adapter for edge runtimes (Cloudflare Workers, Deno, browser)
 * - Zero side effects: no instances created at module load time
 * - Explicit configuration: users must explicitly create logger instances
 */

// Export core API only
export { DefaultLogger, createLogger } from "~/api/logger.js";

// Export types
export type { Logger, LoggerConfig, LogLevel } from "~/types/index.js";
