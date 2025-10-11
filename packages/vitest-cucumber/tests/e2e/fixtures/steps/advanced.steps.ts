import { Given, When, Then } from "@cucumber/cucumber";
import { strict as assert } from "assert";

// State management for calculator
interface CalculatorState {
  a?: number;
  b?: number;
  result?: number;
  initialized: boolean;
  displayCleared: boolean;
  mode?: "addition" | "multiplication";
}

const state: CalculatorState = {
  initialized: false,
  displayCleared: false,
};

// Helper function to reset state between tests
export function resetCalculatorState() {
  state.a = undefined;
  state.b = undefined;
  state.result = undefined;
  state.initialized = false;
  state.displayCleared = false;
  state.mode = undefined;
}

// Scenario Outline steps
Given("I have numbers {int} and {int}", (a: number, b: number) => {
  state.a = a;
  state.b = b;
});

When("I {word} them", (operation: string) => {
  if (state.a === undefined || state.b === undefined) {
    throw new Error("Numbers not set");
  }

  switch (operation) {
    case "add":
      state.result = state.a + state.b;
      break;
    case "subtract":
      state.result = state.a - state.b;
      break;
    case "multiply":
      state.result = state.a * state.b;
      break;
    case "divide":
      state.result = state.a / state.b;
      break;
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
});

Then("the result should be {int}", (expected: number) => {
  assert.strictEqual(state.result, expected);
});

// Background steps
Given("the calculator is initialized", () => {
  state.initialized = true;
});

Given("the display is cleared", () => {
  state.displayCleared = true;
});

// Addition operation - supports both Background and Rule contexts
When("I add {int} and {int}", (a: number, b: number) => {
  // Check for background initialization (if set)
  if (state.displayCleared && !state.initialized) {
    throw new Error("Calculator not properly initialized");
  }

  // Check for Rule mode (if set)
  if (state.mode && state.mode !== "addition") {
    throw new Error("Calculator not in addition mode");
  }

  state.result = a + b;
});

// Multiplication operation - supports both Background and Rule contexts
When("I multiply {int} and {int}", (a: number, b: number) => {
  // Check for background initialization (if set)
  if (state.displayCleared && !state.initialized) {
    throw new Error("Calculator not properly initialized");
  }

  // Check for Rule mode (if set)
  if (state.mode && state.mode !== "multiplication") {
    throw new Error("Calculator not in multiplication mode");
  }

  state.result = a * b;
});

When("I subtract {int} from {int}", (b: number, a: number) => {
  if (!state.initialized || !state.displayCleared) {
    throw new Error("Calculator not properly initialized");
  }
  state.result = a - b;
});

// Rule-specific background steps
Given("the calculator is in addition mode", () => {
  state.mode = "addition";
  state.initialized = true;
});

Given("the calculator is in multiplication mode", () => {
  state.mode = "multiplication";
  state.initialized = true;
});
