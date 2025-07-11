# Story 2.2: Build Polymarket & Tournament UI

**Epic:** 2: The Unified dApp Experience
**Status:** Approved

## User Story

- **As a user,** I want a clean, responsive interface to browse active prediction markets and view tournament progress,
- **So that** I can seamlessly engage with the platform's core features on both desktop and mobile.

## Acceptance Criteria

1.  **Polymarket Page Created:** A new page is created at the route `/polymarket`.
2.  **Market List Renders:** The `/polymarket` page successfully fetches data from the refactored `polymarketService` and displays a list of active markets using the `MarketList.tsx` component.
3.  **Tournament Bracket Page Created:** A new dynamic page is created at the route `/tournaments/[id]`.
4.  **Bracket Renders:** The `/tournaments/[id]` page successfully fetches data for a specific tournament from the backend API and renders the bracket using the `TournamentBracket.tsx` component.
5.  **UI is Responsive:** Both pages and their components are fully responsive and functional on screen sizes corresponding to a standard desktop Progressive Web App (PWA) and a mobile Telegram Mini App (TMA).

## Tasks / Subtasks

- [ ] **Task 1 (AC #1, #2):** Create the file `src/pages/polymarket.tsx`. Implement the `MarketList.tsx` component to fetch and display data from the `polymarketService`.
- [ ] **Task 2 (AC #3, #4):** Create the dynamic route file `src/pages/tournaments/[id].tsx`. Implement the `TournamentBracket.tsx` component to fetch and render data from the `/api/v1/tournaments/matches` endpoint.
- [ ] **Task 3 (AC #5):** Test the responsiveness of both pages using browser developer tools to simulate mobile viewports typical for a TMA. Ensure no elements overflow or are unusable.

## Dev Notes

- This story is purely about the frontend UI. It relies on the successful completion of backend service refactoring in Epic 1.
- The UI should be built with `shadcn-ui` components to maintain visual consistency with the existing application.
- For the MVP, "real-time" data on the tournament bracket can be achieved via polling or a manual refresh button. WebSocket integration is deferred.
