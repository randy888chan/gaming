# Testing Strategy

This document outlines the comprehensive testing approach for ensuring the quality and reliability of Quantum Nexus.

### 1. Unit Testing
-   **Scope**: Individual functions, UI components, and API route handlers.
-   **Tools**: Jest, React Testing Library.
-   **Requirements**:
    -   All critical business logic in services (e.g., `aiAdapter`, `CreditConfigService`) must have unit tests.
    -   Unit tests for the new `/api/v1/tournaments` endpoint logic must be created.
    -   Tests for all complex UI components, especially `TournamentBracket.tsx`.

### 2. Integration Testing
-   **Scope**: Interaction between components, services, and the database.
-   **Tools**: Jest, Supertest.
-   **Requirements**:
    -   **Full API Flow:** Write integration tests for the tournament API, covering creation, team registration, and match progression.
    -   **Smart Contract:** Create a Hardhat test to validate the full lifecycle of the `placeBet` function on the `PolymarketAdapter` contract.
    -   **Database:** Test the `first-play-free` flow to ensure correct interaction with the D1 schema.

### 3. End-to-End (E2E) Testing
-   **Scope**: Complete user workflows from the UI through the entire stack.
-   **Tool**: Playwright.
-   **Priority Scenarios**:
    1.  **Onboarding & First Bet**: New user social login -> claim "First Play Free" -> navigates to a Gamba game -> receives and uses a "Smart Bet."
    2.  **Polymarket Betting**: User connects EVM wallet -> browses Polymarket -> places a bet using the `PolymarketAdapter` -> verifies the new position.
    3.  **Tournament Visualization**: User navigates to the tournament page -> views the bracket -> an admin updates a score -> the user sees the winner advance in the UI automatically.
