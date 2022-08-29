# hardhat-storage-layout

<a href="https://www.npmjs.com/package/hardhat-storage-layout"><img alt="hardhat-storage-layout Version" src="https://img.shields.io/npm/v/hardhat-storage-layout"></a>

Generate Ethereum smart contract storage layout with Hardhat. This plugin saves time and avoids human error when a developer tries to update a specific `storage slot` in a remote solidity contract. For more info about the storage layout, please refer to the [official solidity documentation](https://docs.soliditylang.org/en/v0.6.8/internals/layout_in_storage.html).


## Installation

```bash
yarn add --dev hardhat-storage-layout
```

## Configuration

In order to use this Hardhat plugin, you should update the solidity compiler configurations in `hardhat.config.js` as follows:

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
- Add this plugin to `hardhat.config.js`:

```javascript
require('hardhat-storage-layout');
```
- Compile your contracts
- Export the contracts storage layout prior deployment as follows:

```javascript
const hre = require("hardhat");
async function main() {
    ....
    await hre.storageLayout.export();
}
```

```
┌─────────────────┬────────────────┬──────────────┬────────┬─────────────────────────────────────────────────────┐
│ contract        │ state_variable │ storage_slot │ offset │ type                                                │
├─────────────────┼────────────────┼──────────────┼────────┼─────────────────────────────────────────────────────┤
│ ERC20           │ _balances      │      0       │   0    │ t_mapping(t_address,t_uint256)                      │
│ ERC20           │ _allowances    │      1       │   0    │ t_mapping(t_address,t_mapping(t_address,t_uint256)) │
│ ERC20           │ _totalSupply   │      2       │   0    │ t_uint256                                           │
│ ERC20           │ _name          │      3       │   0    │ t_string_storage                                    │
│ ERC20           │ _symbol        │      4       │   0    │ t_string_storage                                    │
│ WatermelonToken │ _balances      │      0       │   0    │ t_mapping(t_address,t_uint256)                      │
│ WatermelonToken │ _allowances    │      1       │   0    │ t_mapping(t_address,t_mapping(t_address,t_uint256)) │
│ WatermelonToken │ _totalSupply   │      2       │   0    │ t_uint256                                           │
│ WatermelonToken │ _name          │      3       │   0    │ t_string_storage                                    │
│ WatermelonToken │ _symbol        │      4       │   0    │ t_string_storage                                    │
└─────────────────┴────────────────┴──────────────┴────────┴─────────────────────────────────────────────────────┘

```

- **contract**: is the name of the contract including its path as prefix
- **state variable**: is the name of the state variable
- **offset**: is the offset in bytes within the storage slot according to the encoding
- **storage slot**: is the storage slot where the state variable resides or starts. This number may be very large and therefore its JSON value is represented as a string.
- **type**: is an identifier used as key to the variable’s type information (described in the following)
