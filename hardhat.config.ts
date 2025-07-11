import { HardhatUserConfig } from "hardhat/config";

import "@openzeppelin/hardhat-upgrades";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      { version: "0.8.26" }, // Prioritize 0.8.26
      { version: "0.8.20" },
      { version: "0.8.22" },
      { version: "0.8.7" },
      { version: "0.7.6" },
      { version: "0.6.6" },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      // Add paths for external libraries
      // This tells Hardhat where to find the imported contracts
      // when using paths like "@zetachain/toolkit/SystemContract.sol"
      // The key should match the import alias, and the value should be the path
      // to the root of the contracts within that package.
      // For example: "@zetachain/toolkit": "node_modules/@zetachain/toolkit/contracts"
      // This is a more robust solution than remappings for Hardhat.
      paths: {
        "@zetachain/toolkit": "node_modules/@zetachain/toolkit/contracts",
        "@zetachain/protocol-contracts":
          "node_modules/@zetachain/protocol-contracts/contracts",
        "@openzeppelin/contracts-upgradeable":
          "node_modules/@openzeppelin/contracts-upgradeable/contracts",
        "@openzeppelin/contracts": "node_modules/@openzeppelin/contracts",
        "@uniswap/v2-periphery": "node_modules/@uniswap/v2-periphery/contracts",
      },
    },
  },
  paths: {
    sources: "./contracts/evm",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
