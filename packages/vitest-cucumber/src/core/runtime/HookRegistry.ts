import type { StepContext } from "~/types";

/**
 * Hook function type
 */
export type HookFunction = (this: StepContext) => void | Promise<void>;

/**
 * Hook definition
 */
export interface HookDefinition {
  type: "Before" | "After" | "BeforeAll" | "AfterAll";
  fn: HookFunction;
}

/**
 * Global registry for Cucumber hooks
 */
export class HookRegistry {
  private static instance: HookRegistry;
  private hooks: HookDefinition[] = [];

  private constructor() {}

  /**
   * Get the singleton instance
   */
  public static getInstance(): HookRegistry {
    if (!HookRegistry.instance) {
      HookRegistry.instance = new HookRegistry();
    }
    return HookRegistry.instance;
  }

  /**
   * Register a hook
   */
  public register(hook: HookDefinition): void {
    this.hooks.push(hook);
  }

  /**
   * Get all hooks of a specific type
   */
  public getHooks(
    type: "Before" | "After" | "BeforeAll" | "AfterAll",
  ): HookDefinition[] {
    return this.hooks.filter((hook) => hook.type === type);
  }

  /**
   * Execute all hooks of a specific type
   */
  public async executeHooks(
    type: "Before" | "After" | "BeforeAll" | "AfterAll",
    context: StepContext,
  ): Promise<void> {
    const hooks = this.getHooks(type);
    for (const hook of hooks) {
      await hook.fn.call(context);
    }
  }

  /**
   * Clear all registered hooks (useful for testing)
   */
  public clear(): void {
    this.hooks = [];
  }

  /**
   * Get all registered hooks
   */
  public getAll(): HookDefinition[] {
    return [...this.hooks];
  }
}
