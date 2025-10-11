import path from "node:path";
import { defineConfig, mergeConfig } from "vitest/config";
import { vitest } from "@deepracticex/config-preset/vitest";

export default mergeConfig(
  vitest.withCucumber({
    steps: "tests/e2e/steps",
    verbose: true,
  }),
  defineConfig({
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./src"),
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }),
);
