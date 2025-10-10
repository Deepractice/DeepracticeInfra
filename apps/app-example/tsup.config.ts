import { createConfig } from "@deepracticex/tsup-config";

export default createConfig({
  entry: ["src/index.ts", "src/cli.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  shims: true,
});
