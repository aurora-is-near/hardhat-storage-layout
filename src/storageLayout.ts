import fs from "fs";
import { HardhatPluginError } from "hardhat/plugins";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";

import "./type-extensions";

const logger = (message: any) => {
  console.log(`[StorageLayout] `, message);
};

export class StorageLayout {
  public env: HardhatRuntimeEnvironment;

  constructor(hre: HardhatRuntimeEnvironment) {
    this.env = hre;
  }

  public async export() {
    const storageLayoutPath = this.env.config.paths.newStorageLayoutPath;
    const outputDirectory = path.resolve(storageLayoutPath);
    if (!outputDirectory.startsWith(this.env.config.paths.root)) {
      throw new HardhatPluginError(
        "output directory should be inside the project directory"
      );
    }
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory);
    }

    for (const fullName of await this.env.artifacts.getAllFullyQualifiedNames()) {
      const {
        sourceName,
        contractName
      } = await this.env.artifacts.readArtifact(fullName);

      for (const artifactPath of await this.env.artifacts.getBuildInfoPaths()) {
        const artifact: Buffer = fs.readFileSync(artifactPath);
        const artifactJsonABI = JSON.parse(artifact.toString());
        if (!artifactJsonABI.output.contracts[sourceName][contractName]) {
          continue;
        }
        logger(
          artifactJsonABI.output.contracts[sourceName][contractName]
            .storageLayout.storage
        );
        // TODO: export the storage layout to the ./storageLayout/output.md
      }
    }
  }
}
