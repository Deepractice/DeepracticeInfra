import { createConfig } from "@deepracticex/tsup-config";

export default createConfig({
  entry: ["src/index.ts"],
  external: ["pino", "pino-pretty"],
});
