const fs = require("fs");
const path = require("path");
const { extendConfig } = require("hardhat/config");

const { HardhatPluginError } = require("hardhat/plugins");

const { TASK_COMPILE } = require("hardhat/builtin-tasks/task-names");

extendConfig(function(config, userConfig) {
  config.storageLayout = {
      path: "./storageLayout",
    ...userConfig.storageLayout
  };
});

task(TASK_COMPILE, async function(args, hre, runSuper) {
  const config = hre.config.storageLayout;

  await runSuper();

  const outputDirectory = path.resolve(hre.config.paths.root, config.path);

  if (!outputDirectory.startsWith(hre.config.paths.root)) {
    throw new HardhatPluginError(
      "resolved path must be inside of project directory"
    );
  }

  if (outputDirectory === hre.config.paths.root) {
    throw new HardhatPluginError("resolved path must not be root directory");
  }

  if (config.clear) {
    if (fs.existsSync(outputDirectory)) {
      fs.rmdirSync(outputDirectory, { recursive: true });
    }
  }

  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
  }

  for (const fullName of await hre.artifacts.getAllFullyQualifiedNames()) {
    const { sourceName, contractName } = await hre.artifacts.readArtifact(
      fullName
    );
    const artifactPath = await hre.artifacts.getBuildInfoPaths();
    const artifact = fs.readFileSync(artifactPath[0]);
    const artifactJsonABI = JSON.parse(artifact);
    if (!artifactJsonABI.output.contracts[sourceName][contractName]) { continue; }
    console.log(
      artifactJsonABI.output.contracts[sourceName][contractName].storageLayout
        .storage
    );
  }
});
