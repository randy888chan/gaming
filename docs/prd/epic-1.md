### **Epic 1: Compliance & Core Refactoring**
*Goal: To fix the foundational misalignment and create a stable, production-ready base that adheres to the System Directive.*

*   **Story 1.1: Refactor Smart Contracts for Omnichain Support**
    *   **As:** The System Architect,
    *   **I want:** The `CrossChainSettlement.sol` and `PolymarketAdapter.sol` contracts to be updated,
    *   **So that:** They correctly handle message formats and addresses for **EVM, Solana, and TON** as relayed by ZetaChain.
    *   **Acceptance Criteria (ACs):**
        1.  `CrossChainSettlement.sol`'s dispatch function correctly handles `bytes` for the destination address to support non-EVM formats.
        2.  `PolymarketAdapter.sol`'s `placeBet` simulation logic is removed and replaced with a production-ready implementation that correctly interfaces with the `onZetaMessage` flow.
        3.  The inefficiency in `onZetaMessage` (multiple decodes) is resolved; the payload is decoded only once.
        4.  New unit tests are added to `test/evm/` to verify omnichain call paths for Solana and TON addresses, ensuring they don't revert.

*   **Story 1.2: Overhaul Backend Services for Omnichain & Production**
    *   **As:** The System Architect,
    *   **I want:** `zetaChainService.ts` and `polymarketService.ts` to be fully implemented,
    *   **So that:** They are production-ready and support all required chains and functions.
    *   **ACs:**
        1.  `zetaChainService.ts` is updated to include methods for sending transactions to Solana and TON via ZetaChain's protocol.
        2.  All hardcoded testnet addresses in `zetaChainService.ts` are removed and replaced with a configuration loader that pulls from Cloudflare secrets.
        3.  `polymarketService.ts` is refactored to exclusively use the `@polymarket/clob-client` SDK for all market data fetching.
        4.  A new function `placePolymarketBet` is added to `polymarketService.ts` for handling write-based interactions.

*   **Story 1.3: Migrate Database to Universal User ID**
    *   **As:** The System Architect,
    *   **I want:** The database schema to be refactored to support multi-chain wallets and provide necessary logging,
    *   **So that:** The system architecture is robust and auditable.
    *   **ACs:**
        1.  A new migration file is created (`infra/d1/schema_v2.sql`).
        2.  The `user_preferences` table primary key is changed from `walletAddress` to a universal `particle_user_id` (string).
        3.  A new table `polymarket_markets_cache` is added to store market data, reducing API calls to Polymarket.
        4.  A new table `zetachain_cctx_log` is added to log all cross-chain transaction hashes for auditing purposes.
