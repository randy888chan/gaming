# Quantum Nexus Architecture Blueprint v1.3

This document is the technical implementation of the `docs/prd.md`. It provides a complete, end-to-end technical design for the Quantum Nexus project. All development must strictly adhere to these specifications.

### **1. Core Architectural Principle: The Universal App**

The entire system is a **Universal App** built on ZetaChain. Our backend logic is deployed once to the ZetaChain zEVM, and it orchestrates interactions with all connected chains. The frontend interacts with ZetaChain as its primary backend, abstracting away the complexity of the underlying chains.

### **2. System Overview Diagram**

```mermaid
graph TD
    subgraph User Layer
        A[User] -- "Social Login" --> B{Particle Network ConnectKit};
        B -- "Provides Smart Wallet & Gas Sponsorship" --> C[Quantum Nexus UI on Cloudflare Pages];
    end

    subgraph Application Layer
        C -- "Places Bet (e.g., on Polymarket)" --> D[Backend API on Cloudflare Workers];
        D -- "Triggers Cross-Chain Call" --> E[zetaChainService.ts];
    end

    subgraph ZetaChain (The Core Logic)
        E -- "Calls zEVM Contract" --> F[CrossChainSettlement.sol on zEVM];
        F -- "Instructs ZetaChain Protocol" --> G{ZetaChain Gateway};
    end

    subgraph Target Chains
        G -- "Executes on Solana" --> H[Gamba v2 Protocol];
        G -- "Executes on EVM" --> I[Polymarket Protocol];
        G -- "Executes on TON" --> J[TON Contracts];
    end

    subgraph Database
        D -- "Reads/Writes State" --> K[(Cloudflare D1)];
    end
```

### **3. Smart Contract Architecture (zEVM)**

*   **`CrossChainSettlement.sol` (The Universal Contract)**
    *   **Deployment:** This contract is deployed **only** to the ZetaChain zEVM.
    *   **Purpose:** To serve as the single, chain-agnostic entry point for all cross-chain operations. It contains no logic specific to Solana, TON, or any other chain.
    *   **Required Function:**
        ```solidity
        /**
         * @notice A generic function to dispatch a message to any connected chain.
         * @param destinationChainId The chain ID of the target chain (from ZetaChain's registry).
         * @param destinationAddress The address of the target contract on the destination chain.
         * @param message The encoded payload for the target contract.
         */
        function dispatchCrossChainCall(
            uint256 destinationChainId,
            bytes memory destinationAddress,
            bytes memory message
        ) external payable;
        ```

*   **`PolymarketAdapter.sol` (The Target Contract)**
    *   **Deployment:** This contract is deployed to the EVM chain where Polymarket resides (e.g., Polygon).
    *   **Purpose:** To be the *target* of a ZetaChain cross-chain call. It unwraps the message from ZetaChain and interacts directly with the Polymarket protocol contracts.
    *   **Required Function:**
        ```solidity
        /**
         * @notice The function called by the ZetaChain protocol upon receiving a cross-chain message.
         * It decodes the message and interacts with the Polymarket contracts.
         */
        function onZetaMessage(
            ZetaInterfaces.ZetaMessage calldata zetaMessage
        ) external override isValidMessage(zetaMessage);
        ```

### **4. Backend Services Architecture**

*   **`zetaChainService.ts`:**
    *   **Purpose:** The sole interface for communicating with our zEVM contract.
    *   **Key Function (`placePolymarketBet`):**
        1.  Takes bet details (market, outcome, amount) as input.
        2.  ABI-encodes the `placeBet` instruction for the `PolymarketAdapter.sol`.
        3.  Calls the `dispatchCrossChainCall` function on our `CrossChainSettlement.sol` contract, passing the destination chain ID for Polymarket and the encoded message.

*   **`polymarketService.ts`:**
    *   **Purpose:** Read-only interaction with Polymarket's public API.
    *   **Implementation:** MUST use the `@polymarket/clob-client` SDK.
    *   **Function (`getMarkets`):** Fetches active markets. MUST respect the API's rate limits. Results will be cached in the D1 `polymarket_markets` table to reduce API calls.

### **5. Database Schema (Definitive)**

*   **Location:** `infra/d1/schema.sql`
*   **Content:** The SQL provided in the previous response is the final, complete schema and must be implemented exactly as written. It correctly uses a universal `user_id`, caches Polymarket data, and logs ZetaChain transactions.

### **6. User Onboarding Flow (Particle Network)**

1.  User clicks "Login with Google."
2.  Particle Network's ConnectKit SDK is invoked.
3.  Upon successful social authentication, Particle creates a new Smart Wallet for the user.
4.  The application frontend receives the user's information, including a universal `user_id`.
5.  When the user performs their first on-chain action (e.g., playing a game), the application will construct the transaction.
6.  Instead of prompting the user to sign, the transaction is sent to the **Particle Network Paymaster API**.
7.  The Paymaster signs and pays the gas fee for the transaction.
8.  The transaction is executed on-chain, completely free and seamless for the new user.

### **7. Full Project Plan & CI/CD**

*   **Task Management:** The Epics and User Stories defined in the PRD will be used to generate specific, actionable tasks for the development agents.
*   **CI/CD:** A GitHub Actions workflow will be created to:
    1.  Install dependencies (`npm ci`).
    2.  Run all tests (`npm test`). This includes unit and integration tests.
    3.  Run a security audit (`npm audit --audit-level=high`). The build **MUST** fail if vulnerabilities are found.
    4.  On a push to the `main` branch, deploy the application to Cloudflare using the Wrangler CLI.
```
