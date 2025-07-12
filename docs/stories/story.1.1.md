### **Execution Blueprint for Story 1.1**

**Objective:** Refactor `CrossChainSettlement.sol` and `PolymarketAdapter.sol` to be secure, efficient, and fully omnichain-compliant (supporting EVM, Solana, TON addresses).

**Developer:** `@james` (Executor)
**Status:** `PENDING`

---

#### **Phase 1: `CrossChainSettlement.sol` Refactoring**

**File to Modify:** `contracts/evm/CrossChainSettlement.sol`

1.  **Modify `initiateSwap` Function:**
    *   Locate the `initiateSwap` function.
    *   Change the type of the `recipient` parameter from `address` to `bytes`. This is the core change to support non-EVM address formats.

2.  **Modify `onCall` Function:**
    *   Locate the `onCall` function that takes `ZetaInterfaces.ZetaMessage` as input.
    *   The `CrossChainSettlementPayload` struct is decoded from the `message` parameter. Ensure the `recipient` field within this payload is correctly handled as `bytes`.
    *   Remove the conditional logic that checks for Bitcoin chain IDs. This is not part of our current scope and adds unnecessary complexity. The logic should be chain-agnostic.
    *   Modify the `_withdraw` function call to correctly pass the `bytes` recipient.

3.  **Modify `_dispatch` Function:**
    *   Ensure the `payload.recipient` (now `bytes`) is correctly passed to the `TokenSwap` event and the `_withdraw` function.

4.  **Modify `_withdraw` Function:**
    *   This function contains critical logic. When `payload.withdraw` is `false` (i.e., a direct transfer on ZetaChain), the logic must differentiate between EVM and non-EVM recipients.
    *   The `isEVMChain` check is incorrect for this purpose. It should check if the `recipient` bytes can be converted to a valid EVM address (i.e., has a length of 20 bytes).
    *   **Implement the following logic:**
        ```solidity
        if (payload.recipient.length == 20) {
            // EVM address: convert bytes to address and transfer
            bool success = IZRC20(payload.targetToken).transfer(
                address(uint160(bytes20(payload.recipient))),
                out
            );
            if (!success) {
                revert TransferFailed("Failed to transfer target tokens to the recipient on EVM ZetaChain");
            }
        } else {
            // Non-EVM address: transfer directly to the bytes recipient
            // Note: This assumes the ZRC20 contract supports transfers to `bytes` recipients.
            // This is a placeholder for the actual cross-chain send logic.
            // For now, we are just ensuring the types are correct. The actual send is handled by the gateway.
        }
        ```
        *(Self-correction: The ZRC20 `transfer` function does not support `bytes`. The correct approach is to pass the `bytes` recipient to the `gateway.withdraw` function, which handles the cross-chain send.)*

    *   **Corrected `_withdraw` Logic:** The `isEVMChain` check should be removed. The `gateway.withdraw` function accepts `bytes` as the recipient, which is what we need. The logic for non-withdrawal transfers needs to be reviewed against the ZRC20 interface, but for now, the primary goal is ensuring the types align for cross-chain sends. The current logic seems to conflate on-chain transfers with cross-chain sends. The focus should be on correctly calling `gateway.withdraw`.

---

#### **Phase 2: `PolymarketAdapter.sol` Refactoring**

**File to Modify:** `contracts/evm/PolymarketAdapter.sol`

1.  **Optimize `onZetaMessage`:**
    *   The current implementation decodes the `message` payload multiple times. Refactor this to decode once at the beginning of the function into a `PolymarketMessagePayload` struct.
    *   Use a `switch` statement or `if/else if` block based on `payload.actionType` to handle the different actions (`splitPosition`, `mergePositions`, `redeemPositions`).

2.  **Remove Simulation Logic from `placeBet`:**
    *   The `placeBet` function should not perform any direct contract calls.
    *   Its **sole responsibility** is to `abi.encode` the `PolymarketMessagePayload` and then call `crossChainSettlement.dispatchCrossChainCall`.
    *   This ensures the adapter acts as a simple, secure entry point that delegates all logic to the universal settlement contract.

3.  **Add `GambaToken` Integration:**
    *   The contract already has an `immutable` `gambaToken` address.
    *   In `onZetaMessage`, add a `require` statement to ensure the `zrc20` token sent with the message is the `gambaToken`.
    *   Emit the `GambaActionExecuted` and `GambaRefund` events as specified.

---

#### **Phase 3: Test Suite Refactoring**

1.  **Create Foundry Test for `CrossChainSettlement.sol`:**
    *   Create a new test file: `test/evm/CrossChainSettlement.t.sol`.
    *   Write a test case that calls `initiateSwap` with a byte-encoded Solana address as the recipient.
    *   Write another test case for a byte-encoded TON address.
    *   Assert that the transactions do not revert and that the `Withdrawn` event is emitted with the correct `bytes` recipient.

2.  **Update Hardhat Test for `PolymarketAdapter.sol`:**
    *   Modify `test/evm/PolymarketAdapter.test.js`.
    *   Update the tests to reflect the refactored `placeBet` function. The test should now verify that `crossChainSettlement.dispatchCrossChainCall` is called with the correctly encoded message payload.
    *   Update the `onZetaMessage` tests to use a single, encoded payload and verify the correct `conditionalTokens` methods are called.

---

This blueprint is now ready for developer execution. The next agent in the sequence, `@james`, will be dispatched to implement these changes.
