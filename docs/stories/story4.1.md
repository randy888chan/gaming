# Story 4.1: Polymarket Market Making Interface

## Status: Draft

## Story

-   **As an advanced user,** I want an interface to place `BUY` and `SELL` limit orders on Polymarket markets.
-   **So that** I can act as a market maker and earn revenue from the bid-ask spread.

## Acceptance Criteria

1.  A new page is created at the route `/pro`.
2.  The `/pro` page features a UI to select an active Polymarket market.
3.  Once a market is selected, the UI displays its current order book (bids and asks).
4.  The interface provides input fields for `price` and `amount` and buttons to submit a `BUY` limit order or a `SELL` limit order.
5.  Submitting an order calls a new backend API endpoint (e.g., `/api/v1/polymarket/orders`).
6.  The backend API correctly constructs and relays the limit order transaction to the `PolymarketAdapter.sol` via the `zetaChainService`.
7.  A separate section on the `/pro` page displays the user's currently open limit orders for the selected market.

## Tasks / Subtasks

-   [ ] **Task 1 (AC: #1, #2, #3, #4, #7):** Implement the frontend Market Making UI.
    -   [ ] **Subtask 1.1:** Create the new page file `src/pages/pro.tsx`.
    -   [ ] **Subtask 1.2:** Create a new component `src/components/polymarket/ProTradingView.tsx`.
    -   [ ] **Subtask 1.3:** The component must use the `polymarketService` to fetch the detailed order book for a selected market.
    -   [ ] **Subtask 1.4:** Build the form with inputs for price/amount and buttons for Buy/Sell.
    -   [ ] **Subtask 1.5:** Implement the logic to display the user's open orders, which will require a new API endpoint to fetch them.

-   [ ] **Task 2 (AC: #5, #6):** Implement the backend Order Management API.
    -   [ ] **Subtask 2.1:** Create a new backend API endpoint at `src/pages/api/v1/polymarket/orders.ts`.
    -   [ ] **Subtask 2.2:** This endpoint must handle `POST` requests to create new limit orders and `GET` requests to fetch a user's open orders.
    -   [ ] **Subtask 2.3:** The `POST` handler must authenticate the user and call the `zetaChainService` with a new, specific payload for creating a limit order.

## Dev Notes

### Technical Guidance from `docs/architecture.md`

*   **Advanced Feature:** This is significantly more complex than the simple "Place Bet" flow. The developer must thoroughly consult the Polymarket CLOB API documentation to understand the exact payload structure required for creating limit orders.
*   **Backend Responsibility:** The backend API is responsible for all payload creation and validation. The frontend should only send the raw user input (price, amount, side).
*   **ZetaChain Interaction:** The interaction with ZetaChain remains the same architecturally. The `zetaChainService` will call the `dispatchCrossChainCall` function on our Universal App contract, but the `message` payload will be different, containing the specific instructions for a limit order.

### Testing

*   **Integration Test:** Create `tests/integration/polymarket-orders-api.test.ts`.
    *   Test the `POST` endpoint by sending a mock order and asserting that the `zetaChainService` is called with the correctly formatted limit order payload.
    *   Test the `GET` endpoint and mock the service to return a list of open orders, asserting the API returns the correct data.
*   **Manual Test Steps:**
    1.  Navigate to the `/pro` page.
    2.  Select a market and view the order book.
    3.  Submit a new `BUY` order at a price slightly below the current best bid.
    4.  Verify that your open order appears in the "My Open Orders" list.
    5.  Verify the transaction on a ZetaChain explorer.

## Dev Agent Record

### Agent Model Used:

### Completion Notes List

### Change Log

| Date       | Version | Description | Author |
| :---       | :---    | :---------- | :----- |
