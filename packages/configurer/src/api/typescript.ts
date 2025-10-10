/**
 * TypeScript configuration presets for Deepractice projects
 */
export const typescript = {
  /**
   * Base configuration: Core TypeScript settings
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
      outDir: "./dist",
      rootDir: "./src",
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

      /* Advanced */
      incremental: true,
      tsBuildInfoFile: ".tsbuildinfo",

      /* Types */
      types: ["vitest/globals"],
    },
    include: ["src/**/*.ts", "src/**/*.tsx"],
    exclude: ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"],
  },
};
