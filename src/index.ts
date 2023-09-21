import { TASK_CHECK, TASK_COMPILE } from "hardhat/builtin-tasks/task-names";
import { extendConfig, extendEnvironment, task } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types";
import path from "path";

import { StorageLayout } from "./storageLayout";
import "./type-extensions";

export const PluginName = "hardhat-storage-layout";

task(TASK_CHECK).setAction(async (args, hre, runSuper) => {
  await hre.storageLayout.export();
  await runSuper(args);
});

task(TASK_COMPILE).setAction(async function (args, hre, runSuper) {
  for (const compiler of hre.config.solidity.compilers) {
    compiler.settings.outputSelection["*"]["*"].push("storageLayout");
  }
  await runSuper(args);
});

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
  hre.storageLayout = lazyObject(() => new StorageLayout(hre));
});

module.exports = {};
