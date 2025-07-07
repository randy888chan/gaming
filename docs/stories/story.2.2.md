# Story 2.2: Tournament Engine MVP

## Status: Draft

## Story

-   **As an administrator,** I want a simple interface to create and manage single-elimination tournaments.
-   **And as a user,** I want to view a real-time tournament bracket.

## Acceptance Criteria

1.  A new page is created at the route `/tournaments` which lists all active tournaments.
2.  A new page is created at the route `/tournaments/[id]` which displays the bracket for a specific tournament.
3.  A new set of CRUD API endpoints exists at `/api/v1/tournaments` for managing tournaments, teams, and matches.
4.  The API endpoints correctly interact with the `tournaments`, `teams`, and `matches` tables in the Cloudflare D1 database.
5.  The `TournamentBracket.tsx` component correctly fetches data from the API and renders a visual representation of the tournament.
6.  An administrator can (via a basic UI or direct API calls for MVP) create a tournament and its associated teams and matches.

## Tasks / Subtasks

-   [ ] **Task 1 (AC: #3, #4):** Implement the backend Tournament API.
    -   [ ] **Subtask 1.1:** Create the file `src/pages/api/v1/tournaments/index.ts` to handle CRUD for tournaments.
    -   [ ] **Subtask 1.2:** Create the file `src/pages/api/v1/tournaments/teams.ts` to handle CRUD for teams.
    -   [ ] **Subtask 1.3:** Create the file `src/pages/api/v1/tournaments/matches.ts` to handle CRUD for matches.
    -   [ ] **Subtask 1.4:** Ensure all endpoints correctly validate input and interact with the D1 database as defined in the schema.

-   [ ] **Task 2 (AC: #1, #2, #5):** Implement the frontend Tournament UI.
    -   [ ] **Subtask 2.1:** Create the file `src/pages/tournaments.tsx` to list all tournaments.
    -   [ ] **Subtask 2.2:** Create the dynamic route file `src/pages/tournaments/[id].tsx` for displaying a single tournament.
    -   [ ] **Subtask 2.3:** Create the component `src/components/tournament/TournamentBracket.tsx`.
    -   [ ] **Subtask 2.4:** The `TournamentBracket.tsx` component must fetch match and team data from the new API endpoints and render the bracket structure.

-   [ ] **Task 3 (AC: #6):** Create a basic admin interface or a script to create a test tournament.
    -   [ ] **Subtask 3.1:** This can be a simple, non-styled page (e.g., `/admin/create-tournament`) that provides a form to call the POST endpoint of the new API.

## Dev Notes

### Technical Guidance from `docs/architecture.md`

*   **Database is the Source of Truth:** All tournament state (teams, matches, scores, winners) is stored in and read from the Cloudflare D1 database. The API endpoints are the sole interface to this data.
*   **API-Driven UI:** The frontend is completely decoupled from the backend. The `TournamentBracket.tsx` component should be "dumb" in that it only renders the data it receives as props from the page, which is responsible for fetching the data from the API.
*   **Real-time (Future):** For the MVP, the bracket can be updated by polling the API or with a manual refresh button. Real-time updates via WebSockets are deferred to a future epic.

### Testing

*   **Integration Tests:**
    *   Create `tests/integration/tournament-management.test.ts`.
    *   Write tests for each new API endpoint (create, read, update, delete for tournaments, teams, and matches). These tests should mock the D1 database.
*   **Manual Test Steps:**
    1.  Use the admin interface/script from Task 3 to create a new tournament with at least 4 teams.
    2.  Navigate to `/tournaments` and verify the new tournament appears in the list.
    3.  Click on the new tournament and verify that the `/tournaments/[id]` page loads and displays an empty bracket.
    4.  Use the API (e.g., with Postman or curl) to update a match with a winner.
    5.  Refresh the bracket page and verify that the winner has advanced to the next round.

## Dev Agent Record

### Agent Model Used:

### Completion Notes List

### Change Log

| Date       | Version | Description | Author |
| :---       | :---    | :---------- | :----- |
