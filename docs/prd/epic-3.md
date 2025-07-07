### **Epic 3: The AI-Powered Growth Engine**
*Goal: To build and activate the automated marketing and user engagement features that will drive platform growth.*

*   **Story 3.1: Programmatic SEO (pSEO) Content Generation**
    *   **As the platform operator,** I want SEO-optimized landing pages for trending markets to be generated automatically.
    *   **So that** we can capture valuable organic search traffic.
    *   **Acceptance Criteria:**
        *   A Cloudflare Worker (`pSeoGenerator-worker.ts`) runs on a CRON schedule (e.g., every 6 hours).
        *   The worker fetches trending market data from our `polymarketService`.
        *   It calls the `aiAdapter` to generate a unique title, meta description, and short article.
        *   The generated content is saved to the `content_metadata` table in our D1 database.

*   **Story 3.2: Automated Social Posting**
    *   **As the platform operator,** I want links to newly created content and major platform events to be posted to social media automatically.
    *   **So that** we can increase our reach and drive user acquisition.
    *   **Acceptance Criteria:**
        *   A Cloudflare Worker (`socialPoster-worker.ts`) is triggered by new entries in the `content_metadata` table.
        *   The worker constructs a post for Twitter/X and posts it via the official Twitter API.

*   **Story 3.3: Smart Bet AI Feature**
    *   **As a user,** I want a "Smart Bet" button that gives me a simple, AI-powered bet suggestion.
    *   **So that** I can have a more engaging and confidence-inspiring betting experience.
    *   **Acceptance Criteria:**
        *   A "Smart Bet" button is available in the UI for applicable games.
        *   Clicking the button calls the `/api/smart-bet` endpoint.
        *   The endpoint returns an AI-generated suggestion (e.g., "Bet High" or "Bet Low") based on user risk profile (from D1) and recent game history.
