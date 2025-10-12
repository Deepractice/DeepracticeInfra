/**
 * Core internal implementation - not exported from package
 */
export { createPinoLogger } from "~/core/pino-adapter.js";
export { createConsoleLogger } from "~/core/console-adapter.js";
export {
  createLoggerAdapter,
  detectEnvironment,
} from "~/core/adapter-factory.js";
export { getCallerInfo } from "~/core/caller-tracker.js";
export type { CallerInfo } from "~/core/caller-tracker.js";
