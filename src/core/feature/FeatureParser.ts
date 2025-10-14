import fs from "fs-extra";

export interface FeatureInfo {
  title: string;
  tags: string[];
  specId?: string;
}

export class FeatureParser {
  /**
   * Parse a Gherkin feature file
   */
  async parseFeature(featurePath: string): Promise<FeatureInfo> {
    if (!(await fs.pathExists(featurePath))) {
      throw new Error(`Feature file not found: ${featurePath}`);
    }

    const content = await fs.readFile(featurePath, "utf-8");
    const lines = content.split("\n");

    let title = "";
    const tags: string[] = [];
    let specId: string | undefined;

    for (const line of lines) {
      const trimmed = line.trim();

      // Parse tags (lines starting with @)
      if (trimmed.startsWith("@")) {
        const lineTags = trimmed.split(/\s+/).filter((t) => t.startsWith("@"));
        tags.push(...lineTags);

        // Extract spec:id if present
        const specIdTag = lineTags.find((t) => t.startsWith("@spec:id="));
        if (specIdTag) {
          specId = specIdTag.replace("@spec:id=", "");
        }
      }

      // Parse feature title (line starting with "Feature:")
      if (trimmed.startsWith("Feature:")) {
        title = trimmed.replace("Feature:", "").trim();
        break;
      }
    }

    return {
      title,
      tags,
      specId,
    };
  }

  /**
   * Add or update @spec:id tag in feature file
   */
  async updateSpecId(featurePath: string, specId: string): Promise<void> {
    if (!(await fs.pathExists(featurePath))) {
      throw new Error(`Feature file not found: ${featurePath}`);
    }

    const content = await fs.readFile(featurePath, "utf-8");
    const lines = content.split("\n");

    let tagLineIndex = -1;
    let hasSpecId = false;

    // Find tag line or feature line
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i]!.trim();

      if (trimmed.startsWith("@")) {
        tagLineIndex = i;
        if (trimmed.includes("@spec:id=")) {
          hasSpecId = true;
          break;
        }
      } else if (trimmed.startsWith("Feature:")) {
        // Feature line found, insert tags before it
        if (tagLineIndex === -1) {
          tagLineIndex = i;
        }
        break;
      }
    }

    if (hasSpecId) {
      // Replace existing @spec:id tag
      lines[tagLineIndex] = lines[tagLineIndex]!.replace(
        /@spec:id=[^\s]+/,
        `@spec:id=${specId}`,
      );
    } else {
      // Add new @spec:id tag
      const newTag = `@spec:id=${specId}`;
      if (tagLineIndex !== -1 && lines[tagLineIndex]!.trim().startsWith("@")) {
        // Append to existing tag line
        lines[tagLineIndex] = `${lines[tagLineIndex]} ${newTag}`;
      } else {
        // Insert new tag line before Feature
        lines.splice(tagLineIndex, 0, newTag);
      }
    }

    await fs.writeFile(featurePath, lines.join("\n"), "utf-8");
  }

  /**
   * Generate spec ID from feature path
   * Example: apps/cli/features/infra/monorepo/init.feature -> cli-infra-monorepo-init
   */
  generateSpecId(featurePath: string): string {
    // Remove extension and split path
    const withoutExt = featurePath.replace(/\.feature$/, "");
    const parts = withoutExt.split("/");

    // Find "features" directory index
    const featuresIndex = parts.indexOf("features");
    if (featuresIndex === -1) {
      throw new Error(
        `Invalid feature path: must contain "features" directory`,
      );
    }

    // Extract parts: app/package name + feature path components
    const appOrPackage = parts[featuresIndex - 1];
    const featureParts = parts.slice(featuresIndex + 1);

    if (!appOrPackage) {
      throw new Error(`Invalid feature path: missing app/package name`);
    }

    // Combine: app-name + feature-path-components
    const idParts = [appOrPackage, ...featureParts];

    return idParts.join("-").toLowerCase();
  }
}
