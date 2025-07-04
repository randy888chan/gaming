# Testing Strategy

This document outlines the comprehensive testing approach for ensuring the quality and reliability of Quantum Nexus.

### 1. Unit Testing
-   **Scope**: Individual functions, UI components, and API route handlers.
-   **Tools**: Jest, React Testing Library.
-   **New Requirements**:
    -   Unit tests for the new `tournaments` API endpoint logic.
    -   Tests for the WebSocket chat service message handlers.

### 2. Integration Testing
-   **Scope**: Interaction between components and API services.
-   **Tools**: Jest, Supertest.
-   **New Requirements**:
    -   Integration test for the full tournament creation and match progression flow.
    -   Integration test to validate the `placeBet` function in the `PolymarketAdapter` contract via Hardhat.
    -   Test the `first-play-free` flow's interaction with the new D1 `user_preferences` schema.

### 3. End-to-End (E2E) Testing
-   **Scope**: Complete user workflows from the UI to the backend.
-   **Tool**: Playwright.
-   **Key Test Scenarios**:
    1.  **Onboarding & First Bet**: New user signs up with social login -> claims free play -> navigates to a game -> places a "Smart Bet."
    2.  **Polymarket Betting Flow**: User connects EVM wallet -> browses Polymarket -> places a bet via the `PolymarketAdapter` -> verifies the position in their profile.
    3.  **Tournament Flow**: Admin creates a tournament -> users join teams -> admin updates match scores -> winner progresses to the next round in the bracket.
