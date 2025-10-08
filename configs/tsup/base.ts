import { defineConfig, type Options } from "tsup";
import path from "path";

/**
 * Create a tsup configuration with Deepractice defaults
 *
 * @param options - Additional tsup options to merge
 * @returns tsup configuration
 */
export function createConfig(
  options: Options = {},
): ReturnType<typeof defineConfig> {
  return defineConfig({
    // Output formats
    format: ["cjs", "esm"],

    // Generate TypeScript declarations
    dts: true,

    // Code splitting
    splitting: false,

    // Source maps
    sourcemap: true,

    // Clean output directory before build
    clean: true,

    // esbuild options
    esbuildOptions(esbuildOptions) {
      // Configure path alias for ~ to resolve to src/
      esbuildOptions.alias = {
        "~": path.resolve(process.cwd(), "./src"),
        ...(esbuildOptions.alias || {}),
      };
    },

    // Merge user options
    ...options,
  });
}

// Default export for direct use
export default createConfig();
