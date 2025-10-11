import type { Plugin } from "vite";
import type { VitestCucumberPluginOptions } from "~/types";
import { FeatureTransformer } from "~/core/transformer";

/**
 * Vitest Cucumber plugin
 */
export function vitestCucumber(
  options: VitestCucumberPluginOptions = {},
): Plugin {
  const transformer = new FeatureTransformer();

  return {
    name: "vitest-cucumber",

    /**
     * Transform .feature files to test code
     */
    transform(code: string, id: string) {
      // Only process .feature files
      if (!id.endsWith(".feature")) {
        return null;
      }

      if (options.verbose) {
        console.log(`[vitest-cucumber] Transforming: ${id}`);
      }

      try {
        const transformed = transformer.transform(code);

        if (options.verbose) {
          console.log(`[vitest-cucumber] Generated code:\n${transformed}`);
        }

        return {
          code: transformed,
          map: null,
        };
      } catch (error) {
        throw new Error(
          `Failed to transform ${id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  };
}
