
---

#### `FILENAME: docs/architecture/smart-contract-integration.md`
```markdown
# Smart Contract Integration

This document defines the integration patterns for smart contracts within Quantum Nexus.

### Polymarket Adapter (`PolymarketAdapter.sol`)

**Problem:** The current implementation lacks a direct-callable function for users to place bets, making the frontend integration non-functional.

**Required Fix:**
A public `placeBet` function must be added to the `PolymarketAdapter.sol` contract. This provides a clear entry point for the frontend to initiate a bet, which will then be orchestrated across chains by ZetaChain.

**Specification:**
```solidity
/**
 * @notice Allows a user to place a bet on a Polymarket market.
 * This function should be payable to receive ZETA for gas fees on the destination chain.
 * @param conditionId The unique identifier for the market condition.
 * @param outcomeIndex The index of the outcome to bet on (e.g., 0 for 'No', 1 for 'Yes').
 * @param amount The amount of collateral token (e.g., USDC) to bet.
 * @param destinationChainId The chain ID of the target EVM chain where Polymarket resides.
 */
function placeBet(
    bytes32 conditionId,
    uint256 outcomeIndex,
    uint256 amount,
    uint256 destinationChainId
) external payable;
