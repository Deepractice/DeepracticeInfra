import { defineConfig } from "tsup";
import type { Options } from "tsup";
import path from "path";

/**
 * Tsup configuration presets for Deepractice projects
 */
export const tsup = {
  /**
   * Base configuration: Standard build setup
   */
  base: defineConfig({
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
  }),

  /**
   * Create a tsup configuration with Deepractice defaults
   *
   * @param options - Additional tsup options to merge
   * @returns tsup configuration
   */
  createConfig: (options: Options = {}) => {
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
  },
};
