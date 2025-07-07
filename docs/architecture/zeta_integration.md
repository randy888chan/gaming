# ZetaChain Integration Architecture

This document outlines the integration of ZetaChain for cross-chain transactions within the gaming platform, focusing on its role in tournament management, liquidity provision, and revenue sharing.

## 1. Overview

ZetaChain serves as the omnichain layer, enabling seamless interoperability between various blockchain networks (EVM chains, Solana, Bitcoin). It facilitates cross-chain asset transfers and message passing, which are crucial for a truly decentralized gaming experience.

## 2. Integration Points

### 2.1. Tournament Entry and Prize Distribution

- **Cross-Chain Deposits**: Users can deposit assets from any connected chain (e.g., ETH from Ethereum, BNB from BSC) into a tournament on ZetaChain. These assets are converted to ZRC-20 tokens on ZetaChain.
- **Prize Distribution**: Tournament winnings, held in ZRC-20 tokens, can be withdrawn by winners to their native chain addresses. ZetaChain handles the conversion and transfer back to the original chain.

### 2.2. Liquidity Provision

- **Omnichain Liquidity Pools**: Liquidity providers can contribute assets from various chains to unified liquidity pools on ZetaChain. This allows for a broader range of assets to be used for tournament participation and payouts.
- **Cross-Chain Swaps**: ZetaChain's capabilities enable efficient cross-chain swaps, allowing the platform to manage and rebalance liquidity across different chains as needed for optimal tournament operations.

### 2.3. Revenue Sharing and Escrow with Polymarket

- **Polymarket Escrow Contracts**: Polymarket's escrow contracts, potentially deployed on an EVM-compatible chain, will interact with ZetaChain for cross-chain settlement.
- **Revenue Settlement**: Revenue generated from tournaments (e.g., platform fees) can be settled via ZetaChain, allowing for efficient transfer to designated revenue sharing contracts or platform wallets on different chains. The `PolymarketAdapter` will be extended to facilitate these cross-chain settlements.

## 3. Technical Implementation Details

### 3.1. ZetaChain Service (`src/services/ZetaChainService.ts`)

This service will encapsulate all interactions with the ZetaChain protocol.

- **Key Functions**:
    - `crossChainTransfer(sourceChain: Chain, targetChain: Chain, asset: string, amount: BigNumber): Promise<CrossChainTx>`: Initiates a cross-chain transfer of a specified asset.
    - `getTransactionStatus(cctxId: string): Promise<TxStatus>`: Retrieves the status of a cross-chain transaction (CCTX).
    - `depositToZetaChain(asset: string, amount: BigNumber, recipient: string): Promise<TransactionReceipt>`: Handles deposits from external chains to ZetaChain, converting assets to ZRC-20.
    - `withdrawFromZetaChain(zrc20Asset: string, amount: BigNumber, targetChain: Chain, recipient: string): Promise<TransactionReceipt>`: Manages withdrawals from ZetaChain to external chains.

### 3.2. Smart Contracts on ZetaChain

- **ZRC-20 Tokens**: Utilize ZetaChain's ZRC-20 standard for representing assets from connected chains.
- **Connector Contracts**: Leverage ZetaChain's `ZetaConnector` contracts for sending and receiving cross-chain messages and assets.
- **Custom Omnichain Contracts**: Deploy custom smart contracts on ZetaChain (e.g., for tournament logic, prize pools) that can receive and send messages/assets to and from connected chains.

### 3.3. Integration with PolymarketAdapter

The `PolymarketAdapter` will be enhanced to:

- Initiate cross-chain transfers for escrow creation and release.
- Monitor ZetaChain CCTX status for Polymarket-related transactions.
- Interact with Polymarket's escrow contracts, potentially via ZetaChain's cross-chain messaging.

## 4. Security Considerations

- **Auditing**: All smart contracts and integration logic must undergo rigorous security audits.
- **Rate Limiting**: Implement rate limiting for cross-chain transactions to prevent abuse and manage network load.
- **Monitoring**: Comprehensive monitoring of ZetaChain CCTX status and cross-chain asset flows is essential.
- **Error Handling**: Robust error handling and fallback mechanisms for failed cross-chain transactions.

## 5. Future Enhancements

- **Account Abstraction**: Explore integration with Particle Network's Account Abstraction features on ZetaChain for enhanced user experience (e.g., gasless transactions, social logins).
- **Advanced Liquidity Strategies**: Implement more sophisticated liquidity management strategies leveraging ZetaChain's omnichain capabilities.