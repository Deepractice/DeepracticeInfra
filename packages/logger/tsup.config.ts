import { tsup } from "@deepracticex/config-preset";

export default tsup.createConfig({
  entry: ["src/index.ts"],
  external: ["pino", "pino-pretty"],
});
