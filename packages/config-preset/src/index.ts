/**
 * @deepracticex/config-preset
 *
 * Pure configuration presets for Deepractice projects.
 * Provides presets for ESLint, Prettier, TypeScript, Commitlint, Vitest, and tsup.
 *
 * @example
 * ```typescript
 * import { eslint, prettier, vitest } from "@deepracticex/config-preset";
 *
 * // Use Vitest base configuration
 * export default vitest.base;
 *
 * // Use ESLint base configuration
 * export default eslint.base;
 *
 * // Use Prettier base configuration
 * export default prettier.base;
 * ```
 */

export * from "./api";
export * from "./types";
