import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/api/cucumber.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  esbuildOptions(options) {
    options.alias = {
      "~": "./src",
    };
  },
});
