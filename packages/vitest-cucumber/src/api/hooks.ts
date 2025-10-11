import { HookRegistry } from "../core/runtime/HookRegistry";
import type { HookFunction } from "../core/runtime/HookRegistry";

/**
 * Hooks for test lifecycle
 */

/**
 * Run before each scenario
 */
export function Before(fn: HookFunction): void {
  const registry = HookRegistry.getInstance();
  registry.register({ type: "Before", fn });
}

/**
 * Run after each scenario
 */
export function After(fn: HookFunction): void {
  const registry = HookRegistry.getInstance();
  registry.register({ type: "After", fn });
}

/**
 * Run before all scenarios
 */
export function BeforeAll(fn: HookFunction): void {
  const registry = HookRegistry.getInstance();
  registry.register({ type: "BeforeAll", fn });
}

/**
 * Run after all scenarios
 */
export function AfterAll(fn: HookFunction): void {
  const registry = HookRegistry.getInstance();
  registry.register({ type: "AfterAll", fn });
}
