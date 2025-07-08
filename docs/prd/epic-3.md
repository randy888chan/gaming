### **Epic 3: AI Growth Engine & UX Enhancements**
*Goal: To activate automated marketing features and implement key UX improvements that create a competitive moat.*

*   **Story 3.1: Implement AI Marketing Workers with Queues**
    *   **As an operator,** I want content to be generated and posted automatically in a resilient way.
    *   **ACs:**
        1.  The `pSeoGenerator-worker.ts` runs on a CRON schedule, fetches trending markets, generates content via `aiAdapter`, and saves it to D1.
        2.  Upon successful content generation, the `pSeoGenerator-worker` pushes a message containing the new content's metadata to a **Cloudflare Queue**.
        3.  The `socialPoster-worker.ts` is configured to be triggered by messages on the Cloudflare Queue.
        4.  The `socialPoster-worker` consumes the message and posts the content to the configured social media platforms.

*   **Story 3.2: Implement Session Keys for Seamless Gameplay**
    *   **As a user,** I want to approve a gameplay session once, so that I can place multiple bets or play multiple rounds without signing every single transaction.
    *   **ACs:**
        1.  The frontend integrates Particle Network's Session Key feature.
        2.  When a user starts a gaming session, they are prompted to sign a session key with defined limits (e.g., total wager value, number of transactions).
        3.  Subsequent transactions within the session's scope are executed automatically using the session key, without a new signature prompt from the user.
