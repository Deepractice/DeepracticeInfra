import { tsup } from "@deepracticex/configurer";

export default tsup.createConfig({
  entry: ["src/index.ts", "src/cli.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  shims: true,
});
