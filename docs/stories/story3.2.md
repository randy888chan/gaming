# Story 3.2: Implement Session Keys & AI Smart Bets

**Epic:** 3: AI Growth Engine & UX Enhancements
**Status:** Approved
**Priority:** HIGH

## User Stories
1.  **As a user,** I want to approve a gameplay session once, so that I can place multiple bets rapidly without signing every single transaction.
2.  **As a user,** I want to see AI-powered "Smart Bet" suggestions to help inform my decisions on Polymarket markets.

## Definition of Ready
- [x] All Phase 1 and 2 stories are complete.
- [x] The `aiAdapter.ts` service (from Story 3.1) is implemented and available.
- [x] Particle Network is fully integrated for user authentication (from Story 2.1).
- [x] UX specifications for Session Keys and the "Smart Bet" feature are clear.

## Acceptance Criteria
1.  **Session Key Flow is Integrated:**
    -   The frontend integrates Particle Network's Session Key feature.
    -   When a user initiates a play action, they are prompted to authorize a session with clear, defined rules (e.g., max total value, max number of transactions, session duration).
    -   A new UI component `src/components/SessionManager.tsx` is created to display the status of the active session (e.g., time remaining, value spent).
2.  **Automatic Signing is Functional:**
    -   Once a session is authorized, subsequent transactions that fall within the session's rules are **automatically signed** by the session key without requiring a new pop-up from the user's wallet.
    -   Transactions that exceed the session's rules will correctly fail or re-prompt the user for authorization.
3.  **"Smart Bet" UI is Implemented:**
    -   A "Get Smart Bet" button is added to the Polymarket market interface (`MarketList.tsx` or a new market detail component).
    -   Clicking the button displays the AI-generated suggestion in a clear, non-intrusive UI element, including the suggested outcome and confidence score.
4.  **"Smart Bet" API is Functional:**
    -   A new API endpoint is created at `/api/smart-bet.ts`.
    -   This endpoint securely accepts a `marketId` and the user's authenticated `particle_user_id`.
    -   It successfully calls the `aiAdapter.getSmartBetSuggestion()` service function and returns the AI-generated suggestion as a JSON response.

## Technical Guidance

-   **Target Files for Modification/Creation:**
    -   `src/components/SessionManager.tsx` (new file)
    -   `src/pages/play/[gameId].tsx` (to integrate session key logic)
    -   `src/components/polymarket/MarketList.tsx` (to add the "Smart Bet" button)
    -   `src/pages/api/smart-bet.ts` (new file)
    -   `src/services/aiAdapter.ts` (to add `getSmartBetSuggestion` function)

-   **Session Key Implementation:**
    -   Follow the official Particle Network documentation for implementing Session Keys with the ConnectKit.
    -   The session authorization should be triggered naturally by the first play action to avoid unnecessary upfront prompts.
    -   **Session Rules:** Define sensible defaults for the session rules, but also allow the user to customize them if possible (e.g., duration: 1 hour, max total wager: 100 USDC).
    -   **SessionManager Component:** This component should be a small, persistent UI element (e.g., in the header or as a floating icon) that appears when a session is active, providing clear feedback to the user.

-   **Smart Bet Implementation:**
    -   **Frontend:** When the user clicks the "Get Smart Bet" button, the frontend should make a `GET` request to `/api/smart-bet?marketId=...`. The `particle_user_id` should be sent via the authenticated session's JWT in the `Authorization` header.
    -   **Backend (`/api/smart-bet.ts`):**
        1.  The handler must first authenticate the user by verifying the JWT.
        2.  Extract `marketId` from the query and `userId` from the decoded token.
        3.  Call `getSmartBetSuggestion(marketId, userId)` from the `aiAdapter`.
        4.  Return the suggestion.
    -   **`aiAdapter.ts` (`getSmartBetSuggestion` function):** This function will encapsulate the logic of calling the external AI service. It will need to be configured with the appropriate API URL and key from the Cloudflare environment secrets.

-   **Security Note:** The `smart-bet` API must be protected. Do not allow unauthenticated requests, as this could lead to abuse of the AI service and incur costs.
