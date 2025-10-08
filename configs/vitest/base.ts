import { defineConfig } from "vitest/config";

export const baseConfig = defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        "dist/**",
        "tests/**",
        "**/*.config.*",
        "**/*.d.ts",
      ],
    },
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.spec.ts"],
    exclude: ["node_modules/**", "dist/**"],
  },
});

export default baseConfig;
