# Gaming Platform Technical Architecture

## 1. System Overview

![Architecture Diagram](architecture-diagram.png)

## 2. Core Components

### 2.1 Cross-Chain Infrastructure

- **ZetaChain Hub**:
  - EVM ↔ Solana ↔ TON message passing
  - Unified liquidity pool for $GMB token
  - Connector contracts deployed at:
    - EVM: `0x3F...` (see [contracts/evm/CrossChainSettlement.sol](/contracts/evm/CrossChainSettlement.sol:10))
    - Solana: `9x8...`

### 2.2 Smart Contract Layer

```solidity
// contracts/evm/PolymarketAdapter.sol
interface IGameSettlement {
    function settleBet(bytes32 gameId, uint256 amount) external;
    function claimReward(address player) external;
}
```

- **Token Contracts**:
  - ERC-20 (EVM): `GMB.sol`
  - SPL (Solana): `gmb-token.so`
  - Jetton (TON): `gmb-jetton.cell`

### 3. Frontend Architecture

**Next.js Application Structure**:

```
src/
├── components/       # Reusable UI components
├── games/            # Game implementations
├── hooks/            # Custom hooks
├── lib/              # Shared utilities
└── pages/
    └── api/          # Serverless endpoints
```

### 4. Backend Services

- **Tournament Engine**:

  - Redis-based leaderboard
  - Real-time updates via WebSockets
  - Matchmaking service in Go (see [src/services/matchmaking](/src/services/matchmaking:5))

- **Cloudflare Stack**:
  ```ts
  // src/pages/api/v1/tournaments.ts
  export const onRequest: PagesFunction<{ DB: D1Database }> = async ({
    env,
    request,
  }) => {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "active";

    const stmt = await env.DB.prepare(
      "SELECT * FROM tournaments WHERE status = ?"
    ).bind(status);

    const results = await stmt.all();
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" },
    });
  };
  ```

### 5. Data Layer

- **OLAP Schema**:
  ```sql
  CREATE TABLE game_outcomes (
    game_id VARCHAR(255) PRIMARY KEY,
    player_address VARCHAR(42),
    wager DECIMAL(18,8),
    outcome SMALLINT,
    chain_id INTEGER
  );
  ```

### 6. Security Architecture

- **Contract Audit Process**:

  1. Static analysis with Slither/Solhint
  2. Formal verification using Certora
  3. Third-party audit rotation every quarter

- **Frontend Protections**:
  - CSP headers with nonce-based script approval
  - Wallet interaction sandboxing
