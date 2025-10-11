/**
 * World context for config-preset tests
 */

export interface ConfigWorld {
  importedConfig?: any;
  exportedConfig?: any;
  customConfig?: any;
  configType?: string;
  configModule?: string;
  commitMessage?: string;
  importPath?: string;
  allConfigs?: any;
  moduleConfig?: any;
  importedModule?: any;
  projectType?: string;
  context: Record<string, any>;
  set(key: string, value: any): void;
  get(key: string): any;
  clear(): void;
}

export function createWorld(): ConfigWorld {
  const context: Record<string, any> = {};

  return {
    context,
    set(key: string, value: any) {
      this.context[key] = value;
    },
    get(key: string) {
      return this.context[key];
    },
    clear() {
      this.context = {};
      this.importedConfig = undefined;
      this.exportedConfig = undefined;
      this.customConfig = undefined;
      this.configType = undefined;
      this.configModule = undefined;
      this.commitMessage = undefined;
      this.importPath = undefined;
      this.allConfigs = undefined;
      this.moduleConfig = undefined;
      this.importedModule = undefined;
      this.projectType = undefined;
    },
  };
}
