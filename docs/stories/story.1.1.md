# Story 1.1: Refactor Smart Contracts for Omnichain Support

**Epic:** 1: Compliance & Core Refactoring
**Status:** Approved

## User Story
- **As:** The System Architect,
- **I want:** The `CrossChainSettlement.sol` and `PolymarketAdapter.sol` contracts to be updated for true omnichain functionality,
- **So that:** The platform can securely and reliably handle transactions originating from EVM, Solana, and TON via ZetaChain.

## Acceptance Criteria
1.  **`CrossChainSettlement.sol` Updated:**
    -   The `dispatchCrossChainCall` function's `destinationAddress` parameter is changed from `address` to `bytes` to accommodate non-EVM address formats.
    -   The contract strictly adheres to a generic dispatcher pattern; it contains no application-specific logic (no references to Polymarket, etc.).
2.  **`PolymarketAdapter.sol` Refactored:**
    -   All placeholder or simulation logic within the `placeBet` function is removed.
    -   The `onZetaMessage` function is optimized to decode the incoming message payload only once, reducing gas consumption.
    -   The contract correctly handles messages dispatched from the `CrossChainSettlement.sol` contract.
3.  **Test Coverage Expanded:**
    -   New unit tests are created in `test/evm/CrossChainSettlement.t.sol` using Foundry to simulate calls with byte-encoded Solana and TON addresses, asserting that the calls do not revert.
    -   Existing Hardhat tests for `PolymarketAdapter.test.js` are updated to reflect the new `onZetaMessage` logic.

## Tasks / Subtasks
-   [ ] **Task 1 (AC #1):** Modify the function signature in `contracts/evm/CrossChainSettlement.sol` from `address` to `bytes` for the `destinationAddress` parameter.
-   [ ] **Task 2 (AC #2):** Refactor `contracts/evm/PolymarketAdapter.sol` to remove simulation code and optimize the `onZetaMessage` function.
-   [ ] **Task 3 (AC #3):** Create a new test file `test/evm/CrossChainSettlement.t.sol` and implement tests for non-EVM address formats.
-   [ ] **Task 4 (AC #3):** Update `test/evm/PolymarketAdapter.test.js` to ensure all tests pass with the refactored contract logic.

## Dev Notes
-   This story is foundational. The security and correctness of these contracts are paramount.
-   Refer to `docs/architecture/architecture.md` for the clear separation of concerns between the universal dispatcher (`CrossChainSettlement`) and the application-specific adapter (`PolymarketAdapter`).
