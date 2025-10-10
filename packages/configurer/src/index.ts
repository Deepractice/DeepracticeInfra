/**
 * @deepracticex/configurer
 *
 * Unified configuration package for Deepractice projects.
 * Provides presets for ESLint, Prettier, TypeScript, Commitlint,
 * Vitest, tsup, and Cucumber.
 *
 * @example
 * ```typescript
 * import { eslint, prettier, typescript } from "@deepracticex/configurer";
 *
 * // Use ESLint default preset
 * export default eslint.default;
 *
 * // Use TypeScript strict preset
 * export default typescript.strict;
 *
 * // Use Prettier default preset
 * export default prettier.default;
 * ```
 */

export * from "./api";
export * from "./types";
