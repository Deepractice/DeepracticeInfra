import path from "node:path";
import { defineConfig, mergeConfig } from "vitest/config";
import { vitest } from "@deepracticex/config-preset/vitest";

export default mergeConfig(
  vitest.withCucumber({
    steps: "tests/e2e/steps",
    verbose: true,
  }),
  defineConfig({
    test: {
      pool: "threads",
      poolOptions: {
        threads: {
          maxThreads: 4,
          minThreads: 1,
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
