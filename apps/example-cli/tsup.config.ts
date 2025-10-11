import { tsup } from "@deepracticex/config-preset/tsup";

export default tsup.createConfig({
  entry: ["src/index.ts", "src/cli.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  shims: true,
});
