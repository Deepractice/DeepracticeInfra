/**
 * app-example
 *
 * Example application demonstrating Deepractice app development standards
 */

export function greet(name: string): string {
  return `Hello, ${name}!`;
}

export function main(): void {
  console.log(greet("World"));
}
