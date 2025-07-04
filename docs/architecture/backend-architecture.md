
#### `FILENAME: docs/architecture/backend-architecture.md`
```markdown
# Backend Architecture

The backend consists of two primary serverless components: Next.js API Routes and Cloudflare Workers.

### Next.js API Routes
-   **Purpose:** For handling synchronous, user-facing requests that require low latency.
-   **Key Endpoints:**
    -   `/api/first-play-free`: Manages new user onboarding and credit claims.
    -   `/api/smart-bet`: Provides real-time AI bet suggestions.
    -   **New `/api/v1/tournaments`**: A new suite of CRUD endpoints must be created to manage tournaments, teams, and matches, interacting directly with the D1 database. This replaces the legacy Firebase Cloud Functions logic.

### Cloudflare Workers
-   **Purpose:** For asynchronous, automated tasks that run on a schedule or in the background.
-   **Key Workers:**
    -   `pSeoGenerator`: A cron-triggered worker that fetches market data and uses the AI adapter to create new pSEO content.
    -   `socialPoster`: A worker triggered by new entries in the `content_metadata` table to post content to social media.

### Real-Time Chat Service
-   **Problem:** The current implementation relies on a non-existent WebSocket server.
-   **Required Solution:** A simple, self-hosted WebSocket backend must be implemented. It can be a lightweight Node.js server (e.g., using the `ws` library) deployed as a separate service or integrated into the Next.js custom server if applicable. It will handle message broadcasting and user presence.
