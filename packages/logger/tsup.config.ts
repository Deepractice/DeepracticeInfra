import { tsup } from "@deepracticex/config-preset";

export default tsup.createConfig({
  entry: [
    "src/index.ts", // Default entry (Node.js with auto-detection)
    "src/nodejs.ts", // Explicit Node.js entry
    "src/cloudflare-workers.ts", // Cloudflare Workers entry
    "src/browser.ts", // Browser entry
    "src/test.ts", // Test environment entry
  ],
  external: ["pino", "pino-pretty"], // Don't bundle pino dependencies
});
