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
        if (!artifactJsonABI.output.contracts[sourceName][contractName]) {
          continue;
        }

        const contract: Row = { name: contractName, stateVariables: [] };
        for (const stateVariable of artifactJsonABI.output.contracts[
          sourceName
        ][contractName].storageLayout.storage) {
          //   if (!stateVariable.length) {
          //     continue;
          //   }

          contract.stateVariables.push({
            name: stateVariable.name,
            slot: stateVariable.slot,
            offset: stateVariable.offset,
            type: stateVariable.type
          });
        }
        data.contracts.push(contract);

        // logger(
        //   artifactJsonABI.output.contracts[sourceName][contractName]
        //     .storageLayout.storage
        // );

        /**
         * Example
         * data = [
         *       { name: contractName,
         *         stateVariables: [
         *          {
         *              name: stateVariable
         *              slot: 0,
         *              offset" 0,
         *              type: t_mapping(t_address,t_uint256)'
         *            }
         *      ]
         * ]
         */

        // TODO: export the storage layout to the ./storageLayout/output.md
      }
    }
    const prettifier = new Prettify(data.contracts);
    prettifier.tabulate();
  }
}
