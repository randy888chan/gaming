# Story 1.2: Overhaul Backend Services for Omnichain & Production

**Epic:** 1: Compliance & Core Refactoring
**Status:** Approved

## User Story
- **As:** The System Architect,
- **I want:** `zetaChainService.ts` and `polymarketService.ts` to be fully implemented and production-ready,
- **So that:** The backend can securely support all required chains and functionalities as defined in the PRD.

## Acceptance Criteria
1.  **`zetaChainService.ts` Omnichain Ready:**
    -   The service is updated to include methods for creating and sending transaction payloads destined for Solana and TON via ZetaChain's protocol.
    -   All hardcoded testnet addresses (e.g., Athens 3) are removed.
    -   A new configuration module is implemented to load RPC URLs, contract addresses, and API keys securely from Cloudflare secrets at runtime.
2.  **`polymarketService.ts` Production Ready:**
    -   The service is refactored to exclusively use the official `@polymarket/clob-client` SDK for all market data fetching.
    -   A new function, `placePolymarketBet`, is implemented. This function constructs the precise payload needed by the `PolymarketAdapter.sol` contract for a betting transaction.
    -   The service includes robust error handling and respects the Polymarket API rate limits.
3.  **Security:**
    -   No private keys or sensitive API keys are present in the codebase. All secrets are loaded via the new configuration module from the Cloudflare environment.

## Tasks / Subtasks
-   [ ] **Task 1 (AC #1):** Update `src/services/zetaChainService.ts` to add functions for Solana and TON transaction encoding.
-   [ ] **Task 2 (AC #1):** Implement a `config.ts` module that securely loads all external service credentials from `process.env`.
-   [ ] **Task 3 (AC #2):** Refactor `src/services/polymarketService.ts` to use `@polymarket/clob-client` and implement the `placePolymarketBet` function.
-   [ ] **Task 4 (AC #3):** Review all backend service files and remove any hardcoded secrets, replacing them with calls to the new config module.

## Dev Notes
-   This is a critical backend refactoring. The goal is to create a secure, configurable, and production-grade service layer.
-   The `placePolymarketBet` function in the Polymarket service does *not* send a transaction itself. It only *constructs* the message payload that will be passed to the `zetaChainService`.
