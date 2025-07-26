# Story 2.2: Build Polymarket & Tournament UI

**Epic:** 2: The Unified dApp Experience
**Status:** Approved
**Priority:** HIGH

## User Stories
1.  **As a user,** I want a clean, responsive interface to browse active prediction markets, so that I can easily find events to bet on.
2.  **As a user,** I want to view the structure and progress of tournaments in a clear bracket format, so that I can follow the action.

## Definition of Ready
- [x] All Phase 1 stories (Security, DB Migration, Contract Refactoring, Backend Services) are complete.
- [x] The UX specifications in `docs/ux-specs/MarketList.md` and `docs/ux-specs/TournamentBracket.md` are approved.
- [x] The `polymarketService` is production-ready and available for use.
- [x] The D1 database schema for tournaments, teams, and matches is in place.

## Acceptance Criteria
1.  **Polymarket UI is Functional:**
    -   A new page is created at the route `/polymarket`.
    -   This page successfully fetches data from a new `/api/v1/polymarket/markets` endpoint.
    -   A new component at `src/components/polymarket/MarketList.tsx` is created and renders the market data, including distinct loading and empty states, precisely as defined in `docs/ux-specs/MarketList.md`.
2.  **Tournament UI is Functional:**
    -   A new dynamic page is created at the route `/tournaments/[id]`.
    -   This page successfully fetches data from the tournament API endpoints (`/api/v1/tournaments/...`).
    -   A new component at `src/components/tournament/TournamentBracket.tsx` is created and renders the tournament data, including loading and empty states, precisely as defined in `docs/ux-specs/TournamentBracket.md`.
3.  **Backend APIs are Implemented:**
    -   A new API endpoint at `/api/v1/polymarket/markets.ts` is created. It uses `polymarketService.ts` to fetch data and includes a caching layer (e.g., in-memory cache with a 5-minute TTL) to minimize external API calls.
    -   New API endpoints for tournaments are created: `/api/v1/tournaments/index.ts`, `.../teams.ts`, and `.../matches.ts`. These endpoints provide the necessary CRUD functionality for their respective tables in the D1 database.
4.  **UI is Fully Responsive:** Both pages and their components are fully responsive and functional for all target viewports (desktop, PWA on mobile, and Telegram Mini App).

## Technical Guidance

-   **Frontend Component Locations:**
    -   `src/pages/polymarket.tsx`
    -   `src/pages/tournaments/[id].tsx`
    -   `src/components/polymarket/MarketList.tsx`
    -   `src/components/tournament/TournamentBracket.tsx`

-   **Frontend Implementation Notes:**
    -   Use a server-state management library like **SWR** or **React Query** for data fetching, caching, and revalidation. This is crucial for a good user experience.
    -   Build all UI elements using the existing `shadcn-ui` components from `src/components/ui/` to ensure visual consistency.
    -   Refer directly to the detailed implementation prompts for guidance on props, state, and structure:
        -   `docs/ux-specs/MarketList.prompt.md`
        -   `docs/ux-specs/TournamentBracket.prompt.md`

-   **Backend API Implementation:**
    -   **Polymarket Proxy API (`/api/v1/polymarket/markets.ts`):** This route should act as a simple, caching proxy. It calls `polymarketService.getSimplifiedMarkets()`, caches the result, and returns it. This protects our app from Polymarket API rate limits and improves performance.
    -   **Tournament APIs (`/api/v1/tournaments/...`):** These routes will be straightforward handlers that query the D1 database. Ensure they are well-structured and handle potential errors gracefully (e.g., tournament not found).
