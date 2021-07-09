import fs from "fs";
import { extendConfig, extendEnvironment } from "hardhat/config";
import { HardhatPluginError, lazyObject } from "hardhat/plugins";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types";
import path from "path";

import "./types";

extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    const storageLayoutUserPath = userConfig.paths?.newStorageLayoutPath;
    let newStorageLayoutPath: string;

    if (storageLayoutUserPath === undefined) {
      newStorageLayoutPath = path.join(config.paths.root, "./storageLayout");
    } else {
      if (path.isAbsolute(storageLayoutUserPath)) {
        newStorageLayoutPath = storageLayoutUserPath;
      } else {
        newStorageLayoutPath = path.normalize(
          path.join(config.paths.root, storageLayoutUserPath)
        );
      }
    }

    config.paths.newStorageLayoutPath = newStorageLayoutPath;
  }
);

extendEnvironment(hre => {
  hre.exportStorageLayout = lazyObject(async () => {
    const storageLayoutPath = hre.config.paths.newStorageLayoutPath;
    const outputDirectory = path.resolve(storageLayoutPath);

    if (!outputDirectory.startsWith(hre.config.paths.root)) {
      throw new HardhatPluginError(
        "output directory should be inside the project directory"
      );
    }
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory);
    }

    for (const fullName of await hre.artifacts.getAllFullyQualifiedNames()) {
      const { sourceName, contractName } = await hre.artifacts.readArtifact(
        fullName
      );
      for (const artifactPath of await hre.artifacts.getBuildInfoPaths()) {
        const artifact: Buffer = fs.readFileSync(artifactPath);
        const artifactJsonABI = JSON.parse(artifact.toString());
        if (!artifactJsonABI.output.contracts[sourceName][contractName]) {
          continue;
        }
        console.log(
          artifactJsonABI.output.contracts[sourceName][contractName]
            .storageLayout.storage
        );
        // TODO: export the storage layout to the ./storageLayout/output.md
      }
    }
  });
});
