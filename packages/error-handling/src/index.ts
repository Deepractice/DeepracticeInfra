/**
 * @deepracticex/error-handling
 *
 * Unified error handling system for Deepractice projects
 * - Type-safe error classes
 * - Error factory for convenient creation
 * - Framework middleware (Express, Hono)
 * - Optional Result type for functional error handling
 */

// Export public API
export * from "~/api/index";

// Export types
export type { Result, Ok, Err } from "~/types/index";
