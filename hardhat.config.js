require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

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
      accounts: process.env.NODE_ENV === 'test' ? ["0123456789012345678901234567890123456789012345678901234567890123"] : [process.env.HARDHAT_PRIVATE_KEY],
    },
    "zetachain-mainnet": {
      url: "https://zetachain-evm.blockpi.network/v1/rpc/public",
      accounts: process.env.NODE_ENV === 'test' ? ["0123456789012345678901234567890123456789012345678901234567890123"] : [process.env.HARDHAT_PRIVATE_KEY],
    },
  },
};