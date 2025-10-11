import { tsup } from "@deepracticex/configurer";

export default tsup.createConfig({
  entry: ["src/index.ts"],
  external: ["express", "hono"],
});
