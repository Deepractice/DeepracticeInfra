export interface FeatureIndexEntry {
  id: string;
  path: string;
  title: string;
  tags: string[];
  lastModified: string;
}

export interface FeatureIndex {
  version: string;
  features: Record<string, FeatureIndexEntry>;
  lastUpdated: string;
}

export interface ValidationIssue {
  type: "error" | "warning";
  category:
    | "missing-spec-id"
    | "invalid-spec-id-format"
    | "duplicate-spec-id"
    | "stale-index-entry"
    | "missing-from-index"
    | "path-mismatch";
  message: string;
  featurePath?: string;
  specId?: string;
  details?: {
    expected?: string;
    found?: string;
    duplicatePaths?: string[];
  };
}

export interface FeatureValidationResult {
  valid: boolean;
  validCount: number;
  invalidCount: number;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  suggestions: string[];
}

export interface ValidateOptions {
  all?: boolean;
  format?: "table" | "json";
  fix?: boolean;
  strict?: boolean;
  fast?: boolean;
  noCache?: boolean;
}
