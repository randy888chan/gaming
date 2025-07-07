### **Epic 2: The Unified dApp Experience**
*Goal: To integrate the core Polymarket and Tournament features, creating a single, powerful application on our stable foundation.*

*   **Story 2.1: Polymarket Market Integration & Betting Flow**
    *   **As a user,** I want to browse active Polymarket prediction markets and place bets directly within the Quantum Nexus UI.
    *   **So that** I can seamlessly switch between playing games and betting on real-world events.
    *   **Acceptance Criteria:**
        *   A `/polymarket` page displays markets fetched from the Polymarket CLOB API via our backend service.
        *   The UI shows outcomes and real-time prices.
        *   A "Place Bet" button on the UI initiates a call to our backend API.
        *   The backend triggers a cross-chain transaction via the `zetaChainService`, targeting the `PolymarketAdapter.sol` contract on the appropriate EVM chain. The user signs this single transaction from their Particle Smart Wallet.

*   **Story 2.2: Tournament Engine MVP**
    *   **As an administrator,** I want a simple interface to create and manage single-elimination tournaments for our supported Gamba games.
    *   **And as a user,** I want to view a real-time tournament bracket.
    *   **Acceptance Criteria:**
        *   Backend includes CRUD APIs at `/api/v1/tournaments`.
        *   An admin UI (can be basic) allows for tournament creation.
        *   A public-facing UI at `/tournaments/{id}` renders the `TournamentBracket.tsx` component with real-time data from the API.
