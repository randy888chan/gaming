# Story 4.2: Build On-Chain Referral System

**Epic:** 4: Internationalization & Advanced Features
**Status:** Approved

## User Story

- **As a user,** I want to earn real, on-chain rewards for referring new users to the platform,
- **So that** I am incentivized to help grow the community.

## Acceptance Criteria

1.  **Referral Link Generation:** A unique referral link containing the user's wallet address is generated and displayed in their profile.
2.  **Referral Attribution:** When a new user signs up using a referral link, their `user_preferences` record in the D1 database is correctly attributed to the referrer.
3.  **On-Chain Payout Logic:** The backend logic is implemented to calculate the referrer's share of the platform fee for each play made by their referred users.
4.  **ZetaChain Payout Execution:** The backend calls the `zetaChainService` to initiate a transparent, on-chain transfer of the referral earnings to the referrer's wallet.
5.  **Transaction Logging:** The CCTX hash of every referral payout transaction is logged in the `zetachain_cctx_log` table for auditing and transparency.

## Tasks / Subtasks

- [ ] **Task 1 (AC #1):** Implement the frontend logic in the user profile page to display the referral link.
- [ ] **Task 2 (AC #2):** Update the user onboarding flow to capture and store the referrer's ID if one is present in the URL.
- [ ] **Task 3 (AC #3, #4):** Implement a new backend service or worker responsible for calculating and dispatching referral payouts. This can be triggered after each play or run in batches.
- [ ] **Task 4 (AC #5):** Ensure the payout service correctly logs the CCTX hash to the D1 database after initiating the transfer via `zetaChainService`.

## Dev Notes

- The transparency of this system is its key selling point. Users should be able to see their referral payouts as actual on-chain transactions, building trust.
- For the MVP, referral payouts can be processed in daily batches to optimize transaction costs. Real-time payouts can be considered as a future enhancement.
