
---

#### `FILENAME: docs/architecture/backend-architecture.md`
```markdown
# Backend Architecture

The backend consists of two primary serverless components: Next.js API Routes and Cloudflare Workers.

### Next.js API Routes
-   **Purpose:** For handling synchronous, user-facing requests that require low latency.
-   **Key Endpoints:**
    -   `/api/first-play-free`: Manages new user onboarding and credit claims against the D1 database.
    -   `/api/smart-bet`: Provides real-time AI bet suggestions.
    -   **New `/api/v1/tournaments`**: A new suite of CRUD endpoints must be created to manage tournaments, teams, and matches. This API will interact directly with the D1 database and replace all logic from the deprecated Firebase Cloud Functions.

### Cloudflare Workers
-   **Purpose:** For asynchronous, automated tasks that run on a schedule or in the background.
-   **Key Workers:**
    -   `pSeoGenerator`: A cron-triggered worker that fetches market data, uses the AI adapter to generate SEO content, and stores it in D1.
    -   `socialPoster`: A worker triggered by new D1 entries to post content to social media.

### Real-Time Chat Service
-   **Problem:** The current implementation in `chatService.ts` points to a non-existent WebSocket server.
-   **Required Solution:** A new, simple WebSocket backend must be implemented. This can be a lightweight Node.js server (e.g., using the `ws` library) deployed as a separate containerized service or, for a more serverless approach, using Cloudflare's Durable Objects, which are well-suited for real-time applications like chat.
