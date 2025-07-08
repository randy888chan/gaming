# Story 3.2: Implement Session Keys for Seamless Gameplay

**Epic:** 3: AI Growth Engine & UX Enhancements
**Status:** Approved

## User Story
- **As a user,** I want to approve a gameplay session once when I start playing,
- **So that:** I can place multiple bets or play multiple game rounds rapidly without being interrupted by a signature prompt for every single transaction.

## Acceptance Criteria
1.  **Session Key Flow Integrated:** The frontend application integrates Particle Network's Session Key feature.
2.  **Session Prompt:** When a user initiates their first "play" action within a session, they are prompted to sign a transaction that authorizes a session key.
3.  **Session Rules Defined:** The session key is created with clearly defined rules, such as:
    -   A maximum total wager amount for the session (e.g., $50).
    -   A maximum number of transactions (e.g., 20 plays).
    -   A session expiration time (e.g., 1 hour).
4.  **Automatic Signing:** Subsequent transactions that fall within the defined session rules are automatically signed by the session key without requiring a new user-facing pop-up.
5.  **Rule Enforcement:** Any transaction that exceeds the session rules (e.g., a wager amount higher than the session's limit) automatically falls back to requiring a manual signature from the user.

## Tasks / Subtasks
-   [ ] **Task 1 (AC #1, #2):** Refactor the core "play" logic in the frontend to check for an active session key before initiating a transaction. If no active key exists, trigger the Particle SDK prompt to create one.
-   [ ] **Task 2 (AC #3):** Define and implement the session key rules. These should be configurable to balance user convenience and security.
-   [ ] **Task 3 (AC #4, #5):** Test both the automatic signing flow (for transactions within the rules) and the manual fallback flow (for transactions that exceed the rules).

## Dev Notes
-   This feature is the cornerstone of the "Web2-like UX" principle. Its successful implementation is critical for user retention.
-   Careful attention must be paid to the security implications of the session key rules. The rules must be restrictive enough to protect users while still providing a seamless experience.
