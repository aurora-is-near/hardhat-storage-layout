import { TASK_COMPILE } from "hardhat/builtin-tasks/task-names";
import { extendConfig, extendEnvironment, subtask } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types";
import path from "path";

import { StorageLayout } from "./storageLayout";
import "./type-extensions";

export const PluginName = "hardhat-storage-layout";

subtask(TASK_COMPILE).setAction(async (args, hre, runSuper) => {
  await hre.storageLayout.export();
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
