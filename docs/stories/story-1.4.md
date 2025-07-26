# Story 1.4: Overhaul Backend Services for Production Readiness

**Epic:** 1: Foundation & Remediation
**Status:** Approved
**Priority:** HIGH

## User Story
- **As:** The System Architect,
- **I want:** `zetaChainService.ts` and `polymarketService.ts` to be fully implemented, secure, and production-ready,
- **So that:** The backend can reliably support all required omnichain functionalities and data fetching as defined in the architecture.

## Definition of Ready
- [x] All necessary API keys and secrets (ZetaChain private key, Polymarket credentials) are available in the Cloudflare development environment secrets.
- [x] The smart contract interfaces are stable following the refactoring in Story 1.2.
- [x] The acceptance criteria are unambiguous and directly testable.

## Acceptance Criteria
1.  **`zetaChainService.ts` is Omnichain Ready:**
    -   The service is updated to include methods for creating and sending transaction payloads destined for **Solana and TON** via ZetaChain's protocol.
    -   All hardcoded testnet addresses or private keys are completely removed. The service is refactored to load all secrets exclusively from the Cloudflare environment.
2.  **`polymarketService.ts` is Production Ready:**
    -   The service is refactored to exclusively use the official `@polymarket/clob-client` SDK for all market data fetching. This replaces any manual `fetch` calls.
    -   A new function, `placePolymarketBet`, is implemented. This function's sole responsibility is to **construct** the precise `bytes` payload for the `PolymarketAdapter.sol` contract. It **must not** send a transaction itself.
3.  **Security Compliance:** A search of the entire `src/` directory confirms that no private keys, API secrets, or other sensitive credentials are present in the codebase.

## Technical Guidance
This story creates a secure and configurable service layer, which is critical for production.

-   **Target Files for Modification:**
    -   `src/services/zetaChainService.ts`
    -   `src/services/polymarketService.ts`
    -   `test/services/zetaChainService.test.ts`
    -   `test/services/polymarketService.test.ts`

-   **`zetaChainService.ts` Implementation Notes:**
    -   The service should have a unified `dispatchCrossChainCall` method that can handle different address formats.
    -   The recipient address for Solana and TON must be passed as a `Uint8Array` (bytes) to the contract interaction methods.
    -   **Secret Management:**
        ```typescript
        // This service MUST be initialized in a context where Cloudflare env secrets are available.
        // Example for a Cloudflare Worker:
        // const zetaService = new ZetaChainService({
        //   zetaChainRpcUrl: env.ZETACHAIN_RPC_URL,
        //   crossChainSettlementAddress: env.ZETACHAIN_CONTRACT_ADDRESS,
        //   privateKey: env.ZETACHAIN_PRIVATE_KEY, // Loaded securely from secrets
        // });
        ```

-   **`polymarketService.ts` Implementation Notes:**
    -   **SDK Integration:**
        ```typescript
        import { ClobClient } from '@polymarket/clob-client';

        // Initialize the client for read-only operations
        const clobClient = new ClobClient('https://clob.polymarket.com/');

        export const getSimplifiedMarkets = async (cursor = "") => {
          // Use the SDK method
          return await clobClient.getSimplifiedMarkets({ next_cursor: cursor });
        };
        ```
    -   **Payload Construction:** The `placePolymarketBet` function must be pure; it should take market data as input and return the encoded `bytes` payload. This decouples payload creation from the transaction sending logic in `zetaChainService`.

-   **Testing:**
    -   Unit tests for `zetaChainService` should mock the contract calls and verify that addresses for different chains are encoded correctly.
    -   Unit tests for `polymarketService` should verify that `getSimplifiedMarkets` calls the SDK and that `placePolymarketBet` produces a correctly formatted, encoded payload.
