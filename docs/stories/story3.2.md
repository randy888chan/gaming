# Story 3.2: Implement Session Keys & AI Smart Bets

**Epic:** 3: AI Growth Engine & UX Enhancements
**Status:** Approved

## User Story
- **As a user,** I want to approve a gameplay session once and get AI-powered betting suggestions,
- **So that:** I can play faster and make more informed decisions.

## Acceptance Criteria
1.  **Session Key Flow Integrated:** The frontend integrates Particle Network's Session Key feature, prompting the user once to authorize a session with defined rules (e.g., total value, tx count).
2.  **Automatic Signing:** Subsequent transactions within the session's rules are automatically signed by the session key without a new pop-up.
3.  **Smart Bet UI:** A "Get Smart Bet" button is added to the Polymarket market interface.
4.  **Smart Bet API:** A new API endpoint (`/api/smart-bet`) is created. It takes a `marketId` and `userId`, calls the `aiAdapter` service, and returns an AI-generated betting suggestion.

## Dev Notes
- Session Keys are the cornerstone of the "Web2-like UX" principle.
- The Smart Bet feature provides a unique, sticky reason for users to use our platform.
