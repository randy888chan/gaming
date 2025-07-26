# Story 2.1: Implement Seamless Onboarding & First Play Credit

**Epic:** 2: The Unified dApp Experience
**Status:** Approved
**Priority:** HIGH

## User Story
- **As:** a new user,
- **I want:** to sign up in one click using my social account and receive a small, platform-sponsored credit,
- **So that:** I can instantly try any game without needing my own funds or paying for gas fees.

## Definition of Ready
- [x] Phase 1 (Foundation & Remediation) is complete, ensuring the backend is secure.
- [x] The `credit_config` table exists in the database schema as defined in the migration plan (Story 1.3).
- [x] Particle Network credentials (`PROJECT_ID`, `CLIENT_KEY`, `APP_ID`) are available in the environment.
- [x] UX specifications for the onboarding flow are clear.

## Acceptance Criteria
1.  **Particle ConnectKit is the Exclusive Login:** The Particle Network ConnectKit is fully integrated and is the **only** method for user login and wallet connection. The old Solana Wallet Adapter UI is removed.
2.  **Social Login Creates a Smart Wallet:** A successful social login (e.g., via Google, X) automatically creates a new self-custodial Smart Wallet for the user, and the application receives the user's universal `particle_user_id`.
3.  **"First Play Free" System is Functional:**
    -   A new backend API endpoint at `/api/v1/admin/credit-config.ts` is created to manage the rules in the `credit_config` table (enabling/disabling the feature, setting the credit amount). This endpoint is protected and requires authentication.
    -   A new backend service at `src/services/CreditConfigService.ts` is created to encapsulate the business logic for fetching and updating this configuration.
    -   Upon a new user's first interaction, the backend checks if the feature is enabled and credits their account accordingly.
4.  **Legacy Code is Removed:** The old API endpoint at `src/pages/api/referral.ts` and any related client-side logic are completely deleted from the codebase.
5.  **Onboarding UI is Implemented:** A new component, `src/components/onboarding/OnboardingModal.tsx`, is created to guide the user through their first experience after login.

## Technical Guidance

-   **Target Files for Modification/Creation:**
    -   `src/pages/_app.tsx` (to wrap the app with Particle Provider)
    -   `src/components/layout/Header.tsx` (to replace the old connect button)
    -   `src/components/onboarding/OnboardingModal.tsx` (new file)
    -   `src/services/CreditConfigService.ts` (new file)
    -   `src/pages/api/v1/admin/credit-config.ts` (new file)
    -   `src/pages/api/referral.ts` (to be deleted)

-   **Particle Network Integration:**
    -   Use the `@particle-network/connectkit` provider to wrap the application in `_app.tsx`.
    -   The `Header` component should use the `useConnectKit()` hook to trigger the social login modal.
    -   Upon successful connection, the user's information, including the `particle_user_id`, will be available through Particle's hooks. This ID is the universal identifier we must use for all user-related database operations.

-   **First Play Credit Logic:**
    -   The `CreditConfigService` will be the single source of truth for managing the credit rules. It will interact directly with the D1 database.
    -   The admin API endpoint will provide a simple CRUD interface for the `credit_config` table.
    -   When a user performs their first action (e.g., plays a game), the backend API handling that action should:
        1.  Check if this user has already been credited.
        2.  If not, fetch the rules from `CreditConfigService`.
        3.  If the feature is active, apply the credit and mark the user as credited.

-   **UI Flow:**
    1.  User clicks "Connect" in the header.
    2.  Particle Network's social login modal appears.
    3.  User signs in.
    4.  The `OnboardingModal` appears, welcoming the user and informing them of their "First Play Free" credit.
