# Story 2.1: Implement Seamless Onboarding & First Play Credit

**Epic:** 2: The Unified dApp Experience
**Status:** Approved

## User Story
- **As a new user,** I want to sign up in one click using my social account and receive a small, platform-sponsored credit,
- **So that** I can instantly try any game without needing my own funds or paying for gas fees.

## Acceptance Criteria
1.  **Particle ConnectKit Integrated:** The Particle Network ConnectKit is the exclusive method for user login.
2.  **Social Login Creates Wallet:** A successful social login creates a new self-custodial Smart Wallet for the user.
3.  **Credit System Implemented:** A new API endpoint (`/api/v1/admin/credit-config`) is created to manage the "First Play Free" rules.
4.  **Backend Credit Service:** A new backend service (`CreditConfigService.ts`) is created to manage the logic for crediting new users.
5.  **Legacy Code Removed:** The old API endpoint at `src/pages/api/referral.ts` and related logic are deleted.

## Dev Notes
- This feature is a key user acquisition strategy. The experience must be frictionless.
- The credit amount and rules will be configurable via the new admin endpoint, allowing for flexible marketing campaigns.
