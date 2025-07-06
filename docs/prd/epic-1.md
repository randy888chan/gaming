# Epic 1: Establish Core Platform Functionality and User Onboarding

## Story 1: Implement "First Play Free" Credit System

As a new user, I want to receive a one-time, micro-value credit upon signup so I can try a game risk-free.

### Acceptance Criteria
*   A new user successfully signs up using a social login via Particle Network.
*   Upon successful signup, the user is automatically granted a one-time, predefined micro-value credit.
*   The system correctly records that the user has claimed their "First Play Free" credit.
*   A returning user who has already claimed the credit is prevented from claiming it again.
*   The credit amount is configurable via the `CreditConfigService`.

### Technical Guidance
*   **Frontend:** Trigger Particle Network signup and then call the `/api/first-play-free` endpoint.
*   **Backend API (`src/pages/api/first-play-free.ts`):**
    *   Implement the `/api/first-play-free` endpoint using Next.js API Routes.
    *   Verify the user token provided by Particle Network.
    *   Interact with the D1 database (`user_preferences` table) to check and update the `hasClaimedFirstPlay` status.
    *   The credit amount should be fetched or configured via `CreditConfigService`. For MVP, a default of 0.001 can be used if configuration is not immediately available.
    *   Handle errors gracefully.
*   **Database:** Ensure `user_preferences` table in D1 has `walletAddress` and `hasClaimedFirstPlay` fields.
*   **Security:** Secure token verification.
*   **Cost-Effectiveness:** Adhere to Cloudflare free tier limits.

---

## Story 2: [Placeholder for next story]