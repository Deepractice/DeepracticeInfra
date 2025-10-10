import { generateCucumberTests } from "@deepracticex/vitest-cucumber";

await generateCucumberTests({
  featureGlob: "features/**/*.feature",
  stepGlob: "tests/e2e/steps/**/*.ts",
});
