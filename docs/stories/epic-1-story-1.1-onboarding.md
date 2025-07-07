# Story 1.1: Seamless Social Onboarding & Gasless First Play

## Status: Draft

## Story

-   **As a new user,** I want to sign up with one click using my social account (e.g., Google, X).
-   **So that** I can immediately access the platform without needing to create or manage a crypto wallet.
-   **And** I want my first few game plays to be completely free and instant, without any gas fee pop-ups or network error messages.

## Acceptance Criteria

1.  The `@particle-network/connectkit` SDK is successfully integrated into the Next.js application.
2.  The application's login/connect button launches the Particle Network modal, which supports social login providers.
3.  A successful social login creates a new self-custodial Smart Wallet for the user.
4.  The Particle Network Paymaster is configured to sponsor the gas fees for the first **2** on-chain transactions initiated by a new user's wallet.
5.  The legacy API endpoint at `src/pages/api/first-play-free.ts` is completely **deleted**.
6.  All calls to the legacy `/api/first-play-free` endpoint from the frontend are removed.
7.  The `hasClaimedFirstPlay` and `referralCredits` columns in the `user_preferences` table are removed from `infra/d1/schema.sql` as they are no longer needed.

## Tasks / Subtasks

-   [ ] **Task 1 (AC: #1):** Install and configure `@particle-network/connectkit` in `src/pages/_app.tsx` using the project's `projectId`, `clientKey`, and `appId`.
-   [ ] **Task 2 (AC: #2, #3):** Replace the existing wallet connection logic in the `Header.tsx` component with a new button that triggers the Particle Connect modal.
-   [ ] **Task 3 (AC: #4):** Configure the Particle Network Paymaster. This may involve settings in the Particle dashboard and ensuring the SDK is initialized correctly to use the Paymaster for transactions. Create a simple test case to verify that a transaction (e.g., a Gamba play) from a new wallet does not require the user to pay gas.
-   [ ] **Task 4 (AC: #5, #6):** Delete the file `src/pages/api/first-play-free.ts` and remove any `fetch` calls to it from the frontend components.
-   [ ] **Task 5 (AC: #7):** Update `infra/d1/schema.sql` to remove the `hasClaimedFirstPlay` and `referralCredits` columns from the `user_preferences` table.

## Dev Notes

### Technical Guidance from `docs/architecture.md`

*   **Authentication & Wallet Provider:** Particle Network is the exclusive WaaS provider. All onboarding and wallet interactions must be handled through their SDK.
*   **Gas Sponsorship:** The "First Play Free" feature is to be implemented **exclusively** via Particle's Paymaster functionality. This is a critical architectural shift. Do not implement any custom credit or free play logic in the database or backend. The goal is to make the first transactions *gasless* for the user, sponsored by the platform.
*   **Database Schema:** The user management system is being simplified. The new source of truth for a user's identity is the `user_id` provided by Particle Network, which will be the primary key in the `user_preferences` table.

### Testing

*   **Unit Tests:** Not applicable for this story, which is primarily integration.
*   **Integration Tests:**
    *   Create a new test file in `tests/integration/` to verify that the Particle login flow can be initiated.
    *   Write a test to ensure the old `/api/first-play-free` endpoint returns a 404 error after being deleted.
*   **Manual Test Steps:**
    1.  In a clean browser session, click the new "Login" button.
    2.  Complete the social login flow using a test Google account.
    3.  Verify that you are logged in and a wallet address is displayed.
    4.  Attempt to play a Gamba game.
    5.  Confirm that the transaction completes **without** requiring a gas fee payment from the user wallet. Repeat for a second transaction.
    6.  The third transaction should prompt for gas as expected.

## Dev Agent Record

### Agent Model Used:

### Debug Log References

### Completion Notes List

### Change Log

| Date | Version | Description | Author |
| :--- | :------ | :---------- | :----- |

```
