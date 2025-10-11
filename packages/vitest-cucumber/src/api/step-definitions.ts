import type { StepFunction } from "~/types";
import { StepRegistry } from "~/core/runtime";

/**
 * Register a Given step
 */
export function Given(pattern: string | RegExp, fn: StepFunction): void {
  const registry = StepRegistry.getInstance();
  registry.register({
    type: "Given",
    pattern,
    fn,
  });
}

/**
 * Register a When step
 */
export function When(pattern: string | RegExp, fn: StepFunction): void {
  const registry = StepRegistry.getInstance();
  registry.register({
    type: "When",
    pattern,
    fn,
  });
}

/**
 * Register a Then step
 */
export function Then(pattern: string | RegExp, fn: StepFunction): void {
  const registry = StepRegistry.getInstance();
  registry.register({
    type: "Then",
    pattern,
    fn,
  });
}

/**
 * Register an And step
 */
export function And(pattern: string | RegExp, fn: StepFunction): void {
  const registry = StepRegistry.getInstance();
  registry.register({
    type: "And",
    pattern,
    fn,
  });
}

/**
 * Register a But step
 */
export function But(pattern: string | RegExp, fn: StepFunction): void {
  const registry = StepRegistry.getInstance();
  registry.register({
    type: "But",
    pattern,
    fn,
  });
}
