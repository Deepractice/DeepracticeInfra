/**
 * Test helpers for step definitions
 * Provides Vitest-compatible assertion API using Node.js assert
 */
import assert from "node:assert/strict";

/**
 * Create a Vitest-compatible expect API using Node.js assert
 */
export function expect(actual: any) {
  return {
    toBe(expected: any) {
      assert.strictEqual(actual, expected);
    },
    toEqual(expected: any) {
      assert.deepStrictEqual(actual, expected);
    },
    toBeTruthy() {
      assert.ok(actual);
    },
    toBeFalsy() {
      assert.ok(!actual);
    },
    toBeUndefined() {
      assert.strictEqual(actual, undefined);
    },
    toBeDefined() {
      assert.notStrictEqual(actual, undefined);
    },
    toBeNull() {
      assert.strictEqual(actual, null);
    },
    toContain(item: any) {
      if (typeof actual === "string") {
        assert.ok(
          actual.includes(item),
          `Expected "${actual}" to contain "${item}"`,
        );
      } else if (Array.isArray(actual)) {
        assert.ok(actual.includes(item), `Expected array to contain ${item}`);
      } else {
        throw new Error("toContain requires string or array");
      }
    },
    toHaveLength(length: number) {
      assert.strictEqual(actual.length, length);
    },
    toHaveProperty(key: string, value?: any) {
      assert.ok(key in actual, `Expected object to have property "${key}"`);
      if (value !== undefined) {
        assert.strictEqual(actual[key], value);
      }
    },
    toBeGreaterThan(n: number) {
      assert.ok(actual > n, `Expected ${actual} to be greater than ${n}`);
    },
    toBeLessThan(n: number) {
      assert.ok(actual < n, `Expected ${actual} to be less than ${n}`);
    },
  };
}
