# Story 2.1: Polymarket Market Integration & Betting Flow

## Status: Draft

## Story

-   **As a user,** I want to browse and view active Polymarket prediction markets directly within the Quantum Nexus UI.
-   **So that** I don't have to leave the platform to find betting opportunities.
-   **And** when I place a bet, the transaction should be handled seamlessly in the background, regardless of which chain my assets are on.

## Acceptance Criteria

1.  A new page is created at the route `/polymarket`.
2.  The `/polymarket` page successfully fetches and displays a list of active markets from the Polymarket CLOB API.
3.  Each market in the list displays its question, outcomes, and current prices.
4.  A "Place Bet" button exists for each market outcome.
5.  Clicking "Place Bet" successfully initiates a single transaction that the user signs with their Particle Smart Wallet.
6.  This user action triggers a new backend API endpoint (e.g., `/api/v1/bet`).
7.  The backend endpoint correctly calls the `zetaChainService`, which then calls our `CrossChainSettlement.sol` contract on the zEVM to execute the bet on the target chain.

## Tasks / Subtasks

-   [ ] **Task 1 (AC: #1, #2, #3):** Create the frontend components.
    -   [ ] **Subtask 1.1:** Create the new page file `src/pages/polymarket.tsx`.
    -   [ ] **Subtask 1.2:** Implement the `polymarketService.ts` to use the `@polymarket/clob-client` SDK for fetching market data. Ensure API rate limits are respected. Cache results in the D1 `polymarket_markets` table.
    -   [ ] **Subtask 1.3:** Create the `src/components/polymarket/MarketList.tsx` component to display the markets fetched by the service. Use `shadcn-ui` components for consistency.

-   [ ] **Task 2 (AC: #4, #5, #6, #7):** Implement the backend betting flow.
    -   [ ] **Subtask 2.1:** Create a new backend API endpoint at `src/pages/api/v1/bet.ts`.
    -   [ ] **Subtask 2.2:** The "Place Bet" button in the UI must call this new `/api/v1/bet` endpoint, passing the market ID, chosen outcome, and wager amount.
    -   [ ] **Subtask 2.3:** The `/api/v1/bet` endpoint must verify the user's JWT from Particle Network.
    -   [ ] **Subtask 2.4:** The endpoint must then call a new function in `zetaChainService.ts`, for example `placePolymarketBet()`.
    -   [ ] **Subtask 2.5:** The `placePolymarketBet()` function must encode the bet details into a message payload and call the `dispatchCrossChainCall` function on our `CrossChainSettlement.sol` zEVM contract.

## Dev Notes

### Technical Guidance from `docs/architecture.md`

*   **Crucial User Flow:** The betting process is architected to be seamless for the user and MUST follow this specific flow:
    1.  **UI (`MarketList.tsx`) -> Our Backend (`/api/v1/bet.ts`) -> Our Service (`zetaChainService.ts`) -> Our zEVM Contract (`CrossChainSettlement.sol`)**.
    2.  The developer **must not** attempt to construct a direct frontend-to-blockchain transaction. The frontend's only job is to make a secure API call to our own backend.
*   **Polymarket Data:** All market data fetching must be done through the `polymarketService`, which uses the official `@polymarket/clob-client` SDK. This centralizes the logic and rate-limiting.
*   **ZetaChain Interaction:** The `zetaChainService` is responsible for all communication with the ZetaChain network. It must correctly format the message for the `PolymarketAdapter.sol` contract before sending it to our Universal App contract.

### Testing

*   **Integration Tests:**
    *   Write a test for the `/api/v1/bet` endpoint. This test should mock the `zetaChainService` and assert that it is called with the correct, encoded payload when the endpoint is hit.
*   **Manual Test Steps:**
    1.  Navigate to the `/polymarket` page and verify that markets are displayed.
    2.  Click the "Place Bet" button for any market outcome.
    3.  Confirm that your Particle Smart Wallet prompts you for a single signature.
    4.  After signing, check the backend logs to confirm the `/api/v1/bet` endpoint was called and that it successfully invoked the `zetaChainService`.
    5.  (Advanced) Check a ZetaChain testnet explorer to verify that a transaction was sent to the `CrossChainSettlement.sol` contract.

## Dev Agent Record

### Agent Model Used:

### Completion Notes List

### Change Log

| Date       | Version | Description | Author |
| :---       | :---    | :---------- | :----- |
