# Story 2.1: Implement Seamless Onboarding & First Play

**Epic:** 2: The Unified dApp Experience
**Status:** Approved

## User Story

- **As a new user,** I want to sign up in one click using my social account,
- **So that** I can instantly access the platform without needing to create or manage a crypto wallet,
- **And** my first few plays are free because the platform pays the gas fees for me.

## Acceptance Criteria

1.  **Particle ConnectKit Integrated:** The `@particle-network/connectkit` SDK is successfully integrated and configured in `src/pages/_app.tsx`.
2.  **Social Login Creates Wallet:** A successful social login (e.g., via Google, X) automatically creates a new self-custodial Smart Wallet for the user via Particle Network.
3.  **Paymaster Sponsors Transactions:** The Particle Network Paymaster is correctly configured and successfully sponsors the gas fees for the first **2** on-chain transactions initiated from any new user's wallet.
4.  **Legacy Code Removed:** The old API endpoint at `src/pages/api/first-play-free.ts` is deleted.
5.  **Legacy DB Columns Removed:** The `hasClaimedFirstPlay` and `referralCredits` columns are removed from the `user_preferences` table in the new `schema_v2.sql`.

## Tasks / Subtasks

- [ ] **Task 1 (AC #1, #2):** Replace the existing wallet connection logic in `src/components/layout/Header.tsx` with a new button that triggers the Particle Connect modal.
- [ ] **Task 2 (AC #3):** Configure the Particle Network Paymaster in the Particle dashboard and ensure the SDK is initialized to use it. This will be verified by testing the gasless transaction flow.
- [ ] **Task 3 (AC #4, #5):** Delete the legacy API file and remove the specified columns from the new schema file.

## Dev Notes

- The "First Play Free" feature is implemented **exclusively** via Particle's Paymaster functionality. No custom credit or free play logic should be built. The goal is to make the user's first transactions _gasless_.
- The user's identity is now the `user_id` provided by Particle Network, which will be used as the primary key in the database.
