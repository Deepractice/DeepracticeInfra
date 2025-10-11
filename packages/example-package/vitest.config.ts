import { vitest } from "@deepracticex/configurer/vitest";
import { defineConfig, mergeConfig } from "vitest/config";
import path from "node:path";

export default mergeConfig(
  vitest.base,
  defineConfig({
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./src"),
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }),
);
