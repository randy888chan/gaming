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
4.  **Bracket Renders:** The `/tournaments/[id]` page successfully fetches data and renders the bracket using the `TournamentBracket.tsx` component.
5.  **UI is Responsive:** Both pages and their components are fully responsive for PWA and TMA viewports.

## Dev Notes
- This story is purely about the frontend UI and depends on the backend services from Epic 1.
- UI should be built with `shadcn-ui` components for visual consistency.
