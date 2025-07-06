# Story: User Profile Management

**Epic:** Epic 1: Establish Core Platform Functionality and User Onboarding

## User Story
As a registered user, I want to view my profile and see my basic information and recent activity so that I can understand my engagement with the platform.

## Definition of Ready
- [ ] All external dependencies (APIs, credentials) are identified and accessible in the secure vault.
- [ ] All acceptance criteria are unambiguous and testable.
- [ ] The QA validation plan, including mandatory MCP checks, is documented.
- [ ] A preliminary security review of the story's scope has been completed.

## Acceptance Criteria
*   A logged-in user can navigate to their profile page.
*   The profile page displays the user's wallet address.
*   The profile page displays a summary of the user's recent activity (e.g., number of tournaments played).
*   The profile page is accessible and displays correctly on both desktop and mobile.

## Technical Guidance
*   **Frontend:**
    *   Create a new route for the user profile (e.g., `/profile`).
    *   Create a `ProfilePage` component within `src/components/profile/`.
    *   Fetch user data from a new API endpoint (e.g., `/api/v1/users/me`).
    *   Display wallet address (obtained from Particle Network or user session).
    *   Fetch and display recent activity data (e.g., tournament participation count) from relevant API endpoints.
    *   Ensure the UI is responsive and follows design standards using Tailwind CSS and shadcn-ui.
*   **Backend API:**
    *   Implement a new endpoint `/api/v1/users/me` to fetch the logged-in user's data. This will likely be in `src/pages/api/v1/users/index.ts`.
    *   This endpoint will need to authenticate the user (e.g., using the token from Particle Network).
    *   It should query the database (likely `user_preferences` or a new `user_activity` table) to gather profile information and activity summaries.
    *   Consider how to efficiently query tournament participation data, potentially by joining with the tournament data.
*   **Database:**
    *   If a new `user_activity` table is needed, define its schema in `infra/d1/schema.sql`.
    *   Ensure the `user_preferences` table can be joined or queried to retrieve necessary user data.