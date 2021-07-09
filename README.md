# hardhat-storage-layout
Generate Ethereum smart contract storage layout with Hardhat.


## Installation

```bash
yarn add --dev hardhat-storage-layout
```

## Configuration

In order to use this Hardhat plugin, you should update the solidity compiler configurations in `hardhat.congig.js` as follows:

```javascript
module.exports = {
  solidity: {
    version: '0.8.3',
    settings: {
        optimizer: {
            enabled: true,
            runs: 1000,
        },
        outputSelection: {
            "*": {
                "*": ["storageLayout"],
            },
          },
    },
  },
  ....
```

## Usage

- Compile your contracts
- Load plugin in your scripts/tasks as follows:

```javascript
const hre = require("hardhat");
const storageLayout = await hre.exportStorageLayout();
console.log(storageLayout);
```