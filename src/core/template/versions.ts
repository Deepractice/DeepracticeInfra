/**
 * Dependency versions for generated projects
 *
 * This file centralizes all dependency versions used in NodeSpec templates.
 * Update these when NodeSpec itself upgrades dependencies.
 */

export const VERSIONS = {
  // Deepractice configs (ecosystem)
  eslintConfig: "^0.0.1",
  prettierConfig: "^0.0.1",
  typescriptConfig: "^0.0.1",
  tsupConfig: "^0.0.1",
  vitestConfig: "^0.0.1",
  cucumberConfig: "^0.0.1",
  commitlintConfig: "^0.0.1",

  // Build tools
  turbo: "^2.3.3",
  typescript: "^5.7.3",
  tsup: "^8.3.5",
  rimraf: "^6.0.1",

  // Testing
  vitest: "^2.1.8",
  cucumber: "^11.1.0",
  tsx: "^4.19.2",

  // Linting and formatting
  eslint: "^9.18.0",
  prettier: "^3.4.2",

  // Git hooks
  lefthook: "^1.10.4",
  commitlint: {
    cli: "^19.6.1",
    config: "^19.6.0",
  },
};
