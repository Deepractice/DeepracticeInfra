/**
 * example-cli
 *
 * Example CLI application demonstrating Deepractice CLI development standards
 */

export function greet(name: string): string {
  return `Hello, ${name}!`;
}

export function main(): void {
  console.log(greet("World"));
}
