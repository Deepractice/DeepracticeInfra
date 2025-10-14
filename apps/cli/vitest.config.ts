import path from "node:path";
import { defineConfig, mergeConfig } from "vitest/config";
import { vitest } from "@deepracticex/config-preset/vitest";

export default mergeConfig(
  vitest.withCucumber({
    steps: "tests/e2e/steps",
    verbose: false,
  }),
  defineConfig({
    test: {
      pool: "forks",
      poolOptions: {
        forks: {
          maxForks: 4,
          minForks: 1,
        },
      },
    },
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./src"),
      },
    },
  }),
);
