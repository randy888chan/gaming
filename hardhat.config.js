require("@nomiclabs/hardhat-waffle");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.0",
  paths: {
    sources: "./contracts/evm",
    tests: "./tests/unit",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    "zetachain-testnet": {
      url: "https://zetachain-athens-evm.blockpi.network/v1/rpc/public",
      accounts: ["YOUR_PRIVATE_KEY"],
    },
    "zetachain-mainnet": {
      url: "https://zetachain-evm.blockpi.network/v1/rpc/public",
      accounts: ["YOUR_PRIVATE_KEY"],
    },
  },
};