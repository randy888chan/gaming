# Quantum Nexus Architecture - Phase 1 Remediation

This document provides the technical specifications required to complete Phase 1 of the Consolidated Project Blueprint. All development work must adhere to these specifications.

### **1. Smart Contract Remediation**

**Target Files:** `contracts/evm/PolymarketAdapter.sol`, `contracts/evm/CrossChainSettlement.sol`

**1.1. `PolymarketAdapter.sol` Modifications:**
*   **Add `placeBet` Function:** The contract MUST include the following public function to serve as a frontend entry point. This replaces the previous non-production simulation.

    ```solidity
    /**
     * @notice Allows a user to place a bet on a Polymarket market via ZetaChain.
     * @param conditionId The unique identifier for the market condition.
     * @param outcomeIndex The index of the outcome to bet on.
     * @param amount The amount of collateral token (e.g., USDC) to bet.
     */
    function placeBet(
        bytes32 conditionId,
        uint256 outcomeIndex,
        uint256 amount
    ) external;
    ```
*   **Gas Efficiency:** The `onZetaMessage` function must be refactored to decode the incoming message payload **only once**, storing the result in memory to reduce redundant `abi.decode` calls and lower gas costs.
*   **Omnichain Hooks:** Add placeholder functions for TON and Solana integration. These will be implemented in a future phase but are required now for architectural consistency.
    ```solidity
    function _sendToSolana(bytes calldata data) internal;
    function _sendToTon(bytes calldata data) internal;
    ```

**1.2. `CrossChainSettlement.sol` Compliance:**
*   The contract must be reviewed and updated to align with the latest `UniversalContract` and `GatewayZEVM` interfaces from the `@zetachain/protocol-contracts` dependency. This includes ensuring correct implementation of `onCall` and `onRevert`.

---

### **2. Database Schema Finalization**

**Target File:** `infra/d1/schema.sql`

The existing schema is insufficient. It MUST be replaced with the following structure to support multi-chain identity, Polymarket data, and ZetaChain logging.

```sql
-- Drop existing tables to ensure a clean slate.
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS tournaments;
DROP TABLE IF EXISTS user_preferences;
DROP TABLE IF EXISTS content_metadata;
DROP TABLE IF EXISTS leads;

-- Central user table, keyed by a universal user_id from Particle Network.
CREATE TABLE user_preferences (
    user_id TEXT PRIMARY KEY NOT NULL, -- Universal ID from Particle
    wallets TEXT, -- JSON object storing addresses by chain_id, e.g., {"solana": "...", "evm": "..."}
    riskTolerance TEXT CHECK(riskTolerance IN ('low', 'medium', 'high')),
    hasClaimedFirstPlay BOOLEAN DEFAULT FALSE,
    referralCredits REAL DEFAULT 0,
    smartBet BOOLEAN DEFAULT TRUE,
    lastLogin DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stores cached data for Polymarket markets.
CREATE TABLE polymarket_markets (
    condition_id TEXT PRIMARY KEY NOT NULL,
    question TEXT NOT NULL,
    category TEXT,
    outcomes TEXT, -- JSON array of possible outcomes
    end_date_iso TEXT,
    last_fetched DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Logs all ZetaChain cross-chain transactions for auditing and status tracking.
CREATE TABLE zetachain_transactions (
    tx_hash TEXT PRIMARY KEY NOT NULL,
    source_chain_id INTEGER NOT NULL,
    destination_chain_id INTEGER NOT NULL,
    status TEXT CHECK(status IN ('pending', 'completed', 'reverted')) NOT NULL,
    user_id TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES user_preferences(user_id)
);

-- (Keep tournament tables as they are for now)
CREATE TABLE tournaments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    format TEXT NOT NULL,
    status TEXT NOT NULL
);
CREATE TABLE teams (
    id TEXT PRIMARY KEY,
    tournament_id TEXT NOT NULL,
    name TEXT NOT NULL
);
CREATE TABLE matches (
    id TEXT PRIMARY KEY,
    tournament_id TEXT NOT NULL,
    round INTEGER NOT NULL,
    team1_id TEXT,
    team2_id TEXT,
    winner_id TEXT
);
