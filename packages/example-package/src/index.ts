/**
 * @deepracticex/template
 *
 * Template package demonstrating Deepractice package standards
 * - Layered architecture (api/types/core)
 * - Path aliases with ~
 * - Interface-first naming
 * - BDD testing with Cucumber
 */

// Export public API
export { DefaultExample, createExample } from "~/api/index";

// Export types
export type { Example, ExampleConfig, ExampleResult } from "~/types/index";

// Default export - ready-to-use instance
import { createExample } from "~/api/example";
export default createExample();
