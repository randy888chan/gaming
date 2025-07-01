# ZetaChain Deployment Guide

This guide explains how to deploy the `PolymarketAdapter.sol` contract to the ZetaChain testnet and mainnet.

## Prerequisites

- Node.js and npm installed
- A wallet with ZETA tokens for gas fees

## Setup

1.  **Install Dependencies:**

    ```bash
    npm install
    ```

2.  **Configure Environment Variables:**

    Create a `.env` file in the root of the project and add your private key:

    ```
    PRIVATE_KEY="YOUR_PRIVATE_KEY"
    ```

    **Note:** Make sure to replace `YOUR_PRIVATE_KEY` with your actual private key.

3.  **Update Hardhat Configuration:**

    Open `hardhat.config.js` and replace `"YOUR_PRIVATE_KEY"` with `process.env.PRIVATE_KEY` in the network configurations.

## Deployment

1.  **Update Deployment Script:**

    Open `scripts/deploy/deploy-polymarket-adapter.ts` and replace the placeholder addresses for `conditionalTokensAddress`, `collateralAddress`, and `zetaConnectorAddress` with the actual addresses for the target network (ZetaChain testnet or mainnet).

2.  **Run Deployment Script:**

    To deploy to the ZetaChain testnet, run the following command:

    ```bash
    npx hardhat run scripts/deploy/deploy-polymarket-adapter.ts --network zetachain-testnet
    ```

    To deploy to the ZetaChain mainnet, run the following command:

    ```bash
    npx hardhat run scripts/deploy/deploy-polymarket-adapter.ts --network zetachain-mainnet
    ```

## Post-Deployment

After deployment, the script will print the address of the deployed `PolymarketAdapter` contract to the console.