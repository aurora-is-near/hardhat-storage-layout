// If your plugin extends types from another plugin, you should import the plugin here.

// To extend one of Hardhat's types, you need to import the module where it has been defined, and redeclare it.
import "hardhat/types/config";
import "hardhat/types/runtime";

declare module "hardhat/types/config" {
  export interface ProjectPathsUserConfig {
    newStorageLayoutPath?: string;
  }
  export interface ProjectPathsConfig {
    newStorageLayoutPath: string;
  }
}

declare module "hardhat/types/runtime" {
  // This is an example of an extension to the Hardhat Runtime Environment.
  // This new field will be available in tasks' actions, scripts, and tests.
  export interface HardhatRuntimeEnvironment {
    storageLayout: {
      export: () => Promise<void>;
    };
  }
}
