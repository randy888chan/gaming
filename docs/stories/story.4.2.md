# Story 4.2: Build On-Chain Referral System

**Epic:** 4: Internationalization & Advanced Features
**Status:** Approved
**Priority:** HIGH

## User Story
- **As:** a user,
- **I want:** to earn real, on-chain rewards for referring new users to the platform,
- **So that:** I am incentivized to help grow the community and can verifiably track my earnings.

## Definition of Ready
- [x] All stories from Phases 1, 2, and 3 are complete.
- [x] The `zetaChainService` is fully functional for dispatching transactions.
- [x] The `user_preferences` table exists and uses `particle_user_id` as the primary key.
- [x] The platform's fee structure (including referral share) is finalized.

## Acceptance Criteria
1.  **Referral Link Generation & Attribution:**
    -   Every authenticated user can retrieve a unique referral link from their profile page (e.g., `.../?ref=<particle_user_id>`).
    -   When a new user signs up after visiting a referral link, the referrer's `particle_user_id` is correctly stored in a new `referrer_id` column in the new user's `user_preferences` record.
2.  **Earnings Calculation is Accurate:**
    -   A new backend service correctly calculates the referrer's share of the platform fee for **every play** made by their referred users.
    -   These earnings are accumulated in a new `referral_earnings` database table, which tracks unpaid balances per user.
3.  **Automated Payouts are Executed On-Chain:**
    -   A new, CRON-triggered Cloudflare Worker (`referralPayout-worker`) runs periodically (e.g., daily).
    -   The worker identifies referrers with an accumulated balance above a minimum threshold (e.g., 1 USDC).
    -   The worker successfully uses `zetaChainService` to initiate a transparent, on-chain transfer of the earnings to the referrer's wallet address.
4.  **Transaction Logging provides an Audit Trail:**
    -   The CCTX hash of every successful referral payout transaction is logged in the `zetachain_cctx_log` table.
    -   The `referral_earnings` table is updated to reflect that the balance has been paid out, preventing double payments.

## Technical Guidance

-   **Target Files for Modification/Creation:**
    -   `src/pages/profile.tsx` (to add referral UI)
    -   `src/services/ReferralService.ts` (new file for business logic)
    -   `src/pages/api/v1/referrals/...` (new API routes for referral data)
    -   `src/workers/referralPayout/index.ts` (new worker for payouts)
    -   *A new database migration script for schema changes.*

-   **Database Schema Changes (New Migration Required):**
    1.  **Add `referrer_id` to `user_preferences` table:**
        ```sql
        ALTER TABLE user_preferences ADD COLUMN referrer_id TEXT REFERENCES user_preferences(particle_user_id);
        ```
    2.  **Create `referral_earnings` table:**
        ```sql
        CREATE TABLE referral_earnings (
            particle_user_id TEXT PRIMARY KEY NOT NULL REFERENCES user_preferences(particle_user_id),
            unpaid_balance_usd REAL DEFAULT 0,
            total_earned_usd REAL DEFAULT 0,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        ```

-   **Referral Attribution Flow:**
    1.  User B visits `.../?ref=<user_A_id>`.
    2.  The frontend client-side code reads the `ref` query parameter and stores it in `localStorage`.
    3.  User B signs up via Particle Network.
    4.  On the first authenticated action, the frontend sends the stored `ref` code along with the request.
    5.  The backend API verifies the `ref` code, validates it's a real user, and updates User B's `referrer_id` in the `user_preferences` table. The `ref` code is then cleared from local storage.

-   **Earnings Calculation (in `ReferralService.ts`):**
    -   This service will be called by the game-playing API endpoint.
    -   When a user makes a play, the API should check if that user has a `referrer_id`.
    -   If yes, calculate the referral fee (e.g., `platform_fee * PLATFORM_REFERRAL_FEE_SHARE`).
    -   Update the referrer's `unpaid_balance_usd` in the `referral_earnings` table within a database transaction.

-   **Payout Worker Logic (`referralPayout-worker`):**
    1.  CRON triggers the worker.
    2.  Query `referral_earnings` for all users where `unpaid_balance_usd >= <payout_threshold>`.
    3.  For each user, initiate a `zetaChainService` transfer for the `unpaid_balance_usd` amount.
    4.  On successful dispatch, record the `cctx_hash` in `zetachain_cctx_log`.
    5.  Update the `referral_earnings` table: decrement `unpaid_balance_usd` and mark the payout as processed to prevent replay attacks.
