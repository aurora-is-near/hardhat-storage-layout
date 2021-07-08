import "hardhat/types/config";

declare module "hardhat/types/config" {
  interface HardhatUserConfig {
    storageLayout?: {
      path?: string;
    };
  }

  interface HardhatConfig {
    storageLayout: {
      path: string;
    };
  }
}
