/**
 * Template Module
 *
 * Provides project and package generation capabilities.
 */

// Monorepo generation (refactored with BaseGenerator)
export { MonorepoGenerator } from "./MonorepoGenerator.js";
export type { MonorepoOptions } from "./MonorepoGenerator.js";

// Package generation (refactored with BaseGenerator)
export { PackageGenerator } from "./PackageGenerator.js";
export type { PackageOptions } from "./PackageGenerator.js";

// App generation (refactored with BaseGenerator)
export { AppGenerator } from "./AppGenerator.js";
export type { AppOptions } from "./AppGenerator.js";

// Service generation (TODO: refactor with BaseGenerator)
export { ServiceGenerator } from "./ServiceGenerator.js";
export type { ServiceOptions } from "./ServiceGenerator.js";

// Legacy exports for backward compatibility
export { MonorepoGenerator as ProjectGenerator } from "./MonorepoGenerator.js";
export type { MonorepoOptions as ProjectOptions } from "./MonorepoGenerator.js";
