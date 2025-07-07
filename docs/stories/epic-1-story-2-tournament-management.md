# Epic 1, Story 2: Tournament Management

## 1. Introduction

This story focuses on the core functionality of tournament management within the gaming platform. It encompasses the creation, configuration, lifecycle management, and integration with external platforms for liquidity and revenue sharing.

## 2. Goals

- Enable platform administrators to create and manage tournaments.
- Define tournament parameters (e.g., game, format, entry fees, prize structure).
- Integrate with external liquidity providers (Gamba, Particle) for entry fees and prize payouts.
- Implement revenue sharing mechanisms with Polymarket for specific tournament types.
- Leverage ZetaChain for cross-chain transactions related to tournament participation and payouts.

## 3. Features

### 3.1. Tournament Creation & Configuration

- **Admin Interface**: A web-based interface for administrators to:
    - Define tournament name, description, and game type.
    - Set entry fees (in various cryptocurrencies).
    - Configure prize pool distribution (e.g., winner-takes-all, top 3, percentage-based).
    - Specify tournament format (e.g., single-elimination, round-robin).
    - Set start and end times.
- **API Endpoints**:
    - `POST /api/v1/tournaments`: Create a new tournament.
    - `PUT /api/v1/tournaments/{id}`: Update an existing tournament.
    - `GET /api/v1/tournaments/{id}`: Retrieve tournament details.
    - `GET /api/v1/tournaments`: List all tournaments.

### 3.2. Tournament Lifecycle Management

- **Status Transitions**: Tournaments will progress through defined states:
    - `Draft`: Initial creation, editable.
    - `Open for Registration`: Users can join.
    - `Active`: Tournament in progress.
    - `Completed`: Results finalized, prizes distributed.
    - `Archived`: Historical record.
- **Automated Transitions**: Implement scheduled jobs or triggers for status changes (e.g., `Open for Registration` to `Active` at start time).

### 3.3. Liquidity Provision Integration (Gamba, Particle)

- **Entry Fee Collection**:
    - Users pay entry fees using various cryptocurrencies.
    - Integration with Gamba and/or Particle Network to facilitate multi-chain deposits into tournament-specific liquidity pools.
    - Funds are held in escrow until tournament completion.
- **Prize Payouts**:
    - Winners receive prizes directly from the liquidity pools.
    - Automated payouts triggered upon tournament completion and result validation.
    - Support for payouts in various cryptocurrencies, potentially leveraging cross-chain capabilities.

### 3.4. Revenue Sharing with Polymarket

- **Conditional Markets**: For specific tournaments (e.g., prediction markets), integrate with Polymarket.
- **Escrow Management**:
    - A portion of entry fees or a dedicated fund is sent to a Polymarket escrow contract.
    - Upon tournament completion, the `PolymarketAdapter` interacts with the escrow contract to release funds.
- **Revenue Distribution**:
    - Funds released from Polymarket escrow are directed to a platform revenue sharing contract.
    - This contract distributes revenue to stakeholders based on predefined rules.

### 3.5. ZetaChain Integration for Cross-Chain Transactions

- **Cross-Chain Deposits**: Utilize ZetaChain to enable users to deposit assets from any connected chain (e.g., Ethereum, BSC, Solana) as entry fees. These assets will be converted to ZRC-20 tokens on ZetaChain for internal platform use.
- **Cross-Chain Payouts**: Facilitate prize payouts to winners' native chain addresses, leveraging ZetaChain's ability to transfer ZRC-20 tokens back to their original chain representation.
- **Polymarket Settlement**: ZetaChain will be used to bridge assets for Polymarket escrow contracts and to settle revenue shares across different chains.

## 4. Technical Considerations

- **Smart Contracts**:
    - Tournament logic contracts (on ZetaChain or a compatible EVM chain).
    - Liquidity pool contracts.
    - Revenue sharing contracts.
- **Off-chain Services**:
    - API for tournament management.
    - Worker services for automated lifecycle transitions, prize distribution, and revenue settlement.
    - Integration services for Gamba, Particle, and Polymarket APIs/SDKs.
- **Database**: Store tournament details, user registrations, and transaction logs.

## 5. Dependencies

- **Gamba SDK/API**: For liquidity provision and interaction with Gamba's platform.
- **Particle Network SDK/API**: For multi-chain wallet integration and potential account abstraction.
- **Polymarket API/Contracts**: For market data and escrow interactions.
- **ZetaChain SDK/Contracts**: For cross-chain asset transfers and messaging.
- **Database**: Cloudflare D1 or similar for tournament data.

## 6. Open Questions / To Be Determined

- Specific smart contract addresses for Gamba, Particle, and Polymarket on various chains.
- Detailed revenue sharing percentages and distribution rules.
- Error handling and retry mechanisms for failed cross-chain transactions.
- UI/UX design for cross-chain deposit/withdrawal flows.