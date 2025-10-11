import { tsup } from "@deepracticex/configurer";

export default tsup.createConfig({
  entry: ["src/cli.ts", "src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  shims: true,
  noExternal: ["@deepracticex/nodespec-core"],
  external: ["fs-extra", "execa", "chalk", "ora", "prompts", "yaml"],
});
