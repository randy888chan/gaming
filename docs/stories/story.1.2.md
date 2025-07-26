# Story 1.2: Refactor Smart Contracts for Omnichain Support

**Epic:** 1: Foundation & Remediation
**Status:** Approved
**Priority:** HIGH

## User Story
- **As:** The System Architect,
- **I want:** The `CrossChainSettlement.sol` and `PolymarketAdapter.sol` contracts to be updated for true omnichain functionality and proper separation of concerns,
- **So that:** The platform can securely and reliably handle transactions for EVM, Solana, and TON via ZetaChain.

## Definition of Ready
- [x] The core architecture in `docs/architecture/architecture.md` defining the contract interaction flow is approved.
- [x] The smart contract source files exist and are ready for modification.
- [x] The acceptance criteria are unambiguous and directly testable with Foundry and Hardhat.

## Acceptance Criteria
1.  **`CrossChainSettlement.sol` is a Generic Dispatcher:**
    -   The `initiateSwap` function's `recipient` parameter is successfully changed from `address` to `bytes` to accommodate non-EVM address formats.
    -   The contract is strictly generic; any logic specific to non-EVM chains (like old Bitcoin chain checks) has been removed.
    -   The `_withdraw` function correctly passes the `bytes` recipient to the `gateway.withdraw` function for omnichain sends.
2.  **`PolymarketAdapter.sol` is a Secure Entry Point:**
    -   The `placeBet` function is refactored to **only** `abi.encode` the betting payload and call `crossChainSettlement.dispatchCrossChainCall`. It **must not** contain any other logic or direct external calls.
    -   The `onZetaMessage` function is optimized to decode the incoming message payload only once at the start of the function.
    -   A `require` statement is added to `onZetaMessage` to ensure the `zrc20` token parameter matches the immutable `gambaToken` address, preventing the use of unauthorized tokens.
3.  **Test Coverage is Expanded and Corrected:**
    -   New Foundry tests are created in `test/evm/CrossChainSettlement.t.sol` that simulate calls using byte-encoded Solana and TON addresses, asserting these transactions do not revert.
    -   The existing Hardhat tests in `test/evm/PolymarketAdapter.test.js` are updated to reflect the new, decoupled interaction flow (i.e., it tests that the `CrossChainSettlement` contract is called correctly, not that Polymarket is called directly).

## Technical Guidance
This is a critical refactoring to align our contracts with the omnichain architecture.

-   **Target Files for Modification:**
    -   `contracts/evm/CrossChainSettlement.sol`
    -   `contracts/evm/PolymarketAdapter.sol`
    -   `test/evm/CrossChainSettlement.t.sol` (new file)
    -   `test/evm/PolymarketAdapter.test.js`

-   **`CrossChainSettlement.sol` Implementation Notes:**
    -   The core change is in the function signature: `function initiateSwap(..., bytes memory recipient, ...)`
    -   The `_withdraw` function should pass the `payload.recipient` (which is of type `bytes`) directly to `gateway.withdraw(...)`. The gateway is designed to handle different byte-encoded address formats. Do not attempt to parse or convert the address within this contract.

-   **`PolymarketAdapter.sol` Implementation Notes:**
    -   **Decoupling `placeBet`:**
        ```solidity
        // Simplified Logic for placeBet function
        function placeBet(...) external {
            // 1. Encode the message payload for the splitPosition action
            bytes memory message = abi.encode(...);

            // 2. Call the universal settlement contract
            crossChainSettlement.dispatchCrossChainCall(
                collateral,
                amount,
                targetToken,
                recipient,
                false // withdrawFlag is false because we are not withdrawing
            );
        }
        ```
    -   **Securing `onZetaMessage`:**
        ```solidity
        function onZetaMessage(...) external override isValidMessage(context) {
            // Add this check at the very beginning
            require(zrc20 == gambaToken, "PolymarketAdapter: Invalid ZRC20 token. Only Gamba token is accepted.");

            // Decode the payload ONCE
            PolymarketMessagePayload memory payload = abi.decode(message, (PolymarketMessagePayload));

            // Use a switch or if/else if block to handle payload.actionType
            if (payload.actionType == 0) { ... }
            // ...
        }
        ```
