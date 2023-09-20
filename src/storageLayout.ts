import fs from "fs";
import { HardhatPluginError } from "hardhat/plugins";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";

import "./type-extensions";
import { Row, Table } from "./types";
import { Prettify } from "./prettifier";

export class StorageLayout {
  public env: HardhatRuntimeEnvironment;

  constructor(hre: HardhatRuntimeEnvironment) {
    this.env = hre;
  }
  public async export(): Promise<void> {

    const data = await this.getStorageLayout();
    const prettier = new Prettify(data.contracts);
    prettier.tabulate();
  }

  public async exportToFile(): Promise<void> {
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
    const data = await this.getStorageLayout();
    // const sortedData = data.contracts.sort((a, b) => {
    //   if (a.name.toLowerCase() == b.name.toLowerCase()) {
    //     a.stateVariables = a.stateVariables.sort((varX, varY) => {
    //       if (varX.name.toLowerCase() == varY.name.toLowerCase()) {

    //       }
    //       return varX.name.localeCompare(varY.name);
    //     })
    //   }
    //   return a.name.localeCompare(b.name);
    // });
    data.contracts.forEach((contract) => {
      contract.stateVariables.forEach((variable) => {
        const line = `${contract.name}: ${variable.name} (storage_slot: ${variable.slot}) (type: ${variable.type}) (numberOfBytes: ${variable.numberOfBytes})`
        fs.writeFileSync(storageLayoutPath, line);
      })
    })
  }

  public async getStorageLayout(): Promise<Table> {
    const buildInfos = await this.env.artifacts.getBuildInfoPaths();
    const artifactsPath = this.env.config.paths.artifacts;
    const artifacts = buildInfos.map((source, idx) => {
      const artifact: Buffer = fs.readFileSync(source);
      return {
        idx,
        source: source.startsWith(artifactsPath)
          ? source.slice(artifactsPath.length)
          : source,
        data: JSON.parse(artifact.toString())
      };
    });

    const names: Array<{ sourceName: string; contractName: string }> = [];
    for (const fullName of await this.env.artifacts.getAllFullyQualifiedNames()) {
      const {
        sourceName,
        contractName
      } = await this.env.artifacts.readArtifact(fullName);
      names.push({ sourceName, contractName });
    }
    names.sort((a, b) => a.contractName.localeCompare(b.contractName));

    const data: Table = { contracts: [] };
    for (const { sourceName, contractName } of names) {
      for (const artifactJsonABI of artifacts) {
        const storage =
          artifactJsonABI.data.output?.contracts?.[sourceName]?.[contractName]
            ?.storageLayout?.storage;
        if (!storage) {
          continue;
        }
        const contract: Row = { name: contractName, stateVariables: [] };
        for (const stateVariable of storage) {
          contract.stateVariables.push({
            name: stateVariable.label,
            slot: stateVariable.slot,
            offset: stateVariable.offset,
            type: this._removeIdentifierSuffix(stateVariable.type),
            idx: artifactJsonABI.idx,
            artifact: artifactJsonABI.source,
            numberOfBytes:
              artifactJsonABI.data.output?.contracts[sourceName][contractName]
                .storageLayout.types[stateVariable.type].numberOfBytes
          });
        }
        data.contracts.push(contract);
      }
    }
    return data;
  }
  private _removeIdentifierSuffix = (type: string) => {
    const suffixIdRegex = /\d+_(storage|memory|calldata|ptr)/g; // id_memory id_storage
    const contractRegex = /^(t_super|t_contract)\(([A-Za-z0-9_]+)\)\d+/g; // t_contract(contractName)id
    const enumRegex = /(t_enum)\(([A-Za-z0-9_]+)\)\d+/g; // t_enum(enumName)id
    return type.replace(suffixIdRegex, '_$1').replace(contractRegex, '$1($2)').replace(enumRegex, '$1($2)');
  };

}
