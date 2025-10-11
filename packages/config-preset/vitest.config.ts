import path from "node:path";
import { defineConfig } from "vitest/config";
import { vitest } from "./src/api/vitest.js";

export default defineConfig({
  ...vitest.withCucumber({
    steps: "tests/e2e/steps",
    verbose: true,
  }),
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
});
