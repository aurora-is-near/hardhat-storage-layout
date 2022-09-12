import fs from "fs";
import { HardhatPluginError } from "hardhat/plugins";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";

import { Prettify } from "./prettifier";
import "./type-extensions";
import { Row, Table } from "./types";

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

    const data: Table = { contracts: [] };

    for (const fullName of await this.env.artifacts.getAllFullyQualifiedNames()) {
      const {
        sourceName,
        contractName
      } = await this.env.artifacts.readArtifact(fullName);

      for (const artifactPath of await this.env.artifacts.getBuildInfoPaths()) {
        const artifact: Buffer = fs.readFileSync(artifactPath);
        const artifactJsonABI = JSON.parse(artifact.toString());
        try {
          if (!artifactJsonABI.output.contracts[sourceName][contractName] && 
            !artifactJsonABI.output.contracts[sourceName][contractName].storageLayout
            ) {
            continue;
          }
        } catch (e) {
          continue;
        }

        const contract: Row = { name: contractName, stateVariables: [] };
        for (const stateVariable of artifactJsonABI.output.contracts[
          sourceName
        ][contractName].storageLayout.storage) {
          contract.stateVariables.push({
            name: stateVariable.label,
            slot: stateVariable.slot,
            offset: stateVariable.offset,
            type: stateVariable.type,
            numberOfBytes:
              artifactJsonABI.output.contracts[sourceName][contractName]
                .storageLayout.types[stateVariable.type].numberOfBytes
          });
        }
        data.contracts.push(contract);
        // TODO: export the storage layout to the ./storageLayout/output.md
      }
    }
    const prettifier = new Prettify(data.contracts);
    prettifier.tabulate();
  }
}
