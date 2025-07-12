# Story 1.2: Overhaul Backend Services for Omnichain & Production

**Epic:** 1: Compliance & Core Refactoring
**Status:** Approved

## User Story
- **As:** The System Architect,
- **I want:** `zetaChainService.ts` and `polymarketService.ts` to be fully implemented and production-ready,
- **So that:** The backend can securely support all required chains and functionalities as defined in the PRD.

## Acceptance Criteria
1.  **`zetaChainService.ts` Omnichain Ready:**
    - The service is updated to include methods for creating and sending transaction payloads destined for Solana and TON via ZetaChain's protocol.
    - All hardcoded testnet addresses are removed. A new configuration module is implemented to load secrets from the Cloudflare environment.
2.  **`polymarketService.ts` Production Ready:**
    - The service is refactored to exclusively use the official `@polymarket/clob-client` SDK for all market data fetching.
    - A new function, `placePolymarketBet`, is implemented. This function **constructs** the precise payload for the `PolymarketAdapter.sol` contract.
3.  **Security:** No private keys or sensitive API keys are present in the codebase.

## Dev Notes
- This is a critical backend refactoring. The goal is to create a secure, configurable service layer.
- The `placePolymarketBet` function does **not** send a transaction itself. It only creates the `bytes` message payload that will be passed to `zetaChainService`.
