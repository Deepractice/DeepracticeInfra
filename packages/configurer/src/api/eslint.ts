import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import type { Linter } from "eslint";

/**
 * ESLint configuration presets for Deepractice projects
 */
export const eslint = {
  /**
   * Base configuration: TypeScript + Prettier integration
   */
  base: [
    js.configs.recommended,
    {
      files: ["**/*.ts", "**/*.tsx"],
      languageOptions: {
        parser: tsParser,
        parserOptions: {
          ecmaVersion: "latest",
          sourceType: "module",
        },
        globals: {
          console: "readonly",
          process: "readonly",
        },
      },
      plugins: {
        "@typescript-eslint": tsPlugin,
        prettier: prettierPlugin,
      },
      rules: {
        ...(tsPlugin.configs?.recommended?.rules || {}),
        ...prettierConfig.rules,
        "prettier/prettier": "error",
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
      },
    },
    {
      ignores: ["dist/**", "node_modules/**", ".wrangler/**", "coverage/**"],
    },
  ] as Linter.Config[],
};
