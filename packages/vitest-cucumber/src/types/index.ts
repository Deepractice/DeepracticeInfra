export interface CucumberRunnerOptions {
  featureGlob: string;
  stepGlob: string;
  formatOptions?: string[];
}

export interface FeatureTestResult {
  featurePath: string;
  featureName: string;
  success: boolean;
  output?: string;
  error?: string;
}
