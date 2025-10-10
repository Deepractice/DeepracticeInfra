/**
 * TypeScript configuration presets for Deepractice projects
 */
export const typescript = {
  /**
   * Base configuration: Core TypeScript compiler options
   * Following @tsconfig/bases best practice: only compiler options, no paths
   * Projects must define their own: outDir, paths, include, exclude
   */
  base: {
    compilerOptions: {
      /* Language and Environment */
      target: "ES2022",
      lib: ["ES2022"],
      module: "ESNext",
      moduleResolution: "Bundler",
      jsx: "react",
      jsxFactory: "h",
      jsxFragmentFactory: "Fragment",

      /* Output */
      sourceMap: true,
      declaration: true,
      declarationMap: true,
      removeComments: false,

      /* Interop */
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      resolveJsonModule: true,
      isolatedModules: true,
      allowJs: true,

      /* Type Checking */
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
      noUncheckedIndexedAccess: true,
      exactOptionalPropertyTypes: false,
      noImplicitOverride: true,

      /* Completeness */
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,

      /* Types */
      types: ["vitest/globals"],
    },
  },
};
