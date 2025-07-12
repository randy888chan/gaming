# Story 4.2: Build On-Chain Referral System

**Epic:** 4: Internationalization & Advanced Features
**Status:** Approved

## User Story
- **As a user,** I want to earn real, on-chain rewards for referring new users to the platform,
- **So that** I am incentivized to help grow the community.

## Acceptance Criteria
1.  **Referral Link Generation:** A unique referral link is generated for each user.
2.  **Referral Attribution:** New user sign-ups are correctly attributed to the referrer in the D1 database.
3.  **On-Chain Payout Logic:** A backend service calculates the referrer's share of the platform fee for each play made by their referred users.
4.  **ZetaChain Payout Execution:** The backend calls `zetaChainService` to initiate a transparent, on-chain transfer of the referral earnings.
5.  **Transaction Logging:** The CCTX hash of every referral payout transaction is logged in the `zetachain_cctx_log` table.

## Dev Notes
- The transparency of this system is its key selling point. Users must be able to see their referral payouts as actual on-chain transactions.
