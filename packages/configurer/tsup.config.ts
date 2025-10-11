import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "api/eslint": "src/api/eslint.ts",
    "api/prettier": "src/api/prettier.ts",
    "api/typescript": "src/api/typescript.ts",
    "api/commitlint": "src/api/commitlint.ts",
    "api/vitest": "src/api/vitest.ts",
    "api/tsup": "src/api/tsup.ts",
    "api/cucumber": "src/api/cucumber.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  treeshake: true,
  external: [
    "@eslint/js",
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint/parser",
    "eslint-config-prettier",
    "eslint-plugin-prettier",
    "@commitlint/config-conventional",
    "vitest",
    "tsup",
    "@deepracticex/vitest-cucumber",
  ],
});
