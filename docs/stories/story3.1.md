# Story 3.1: Programmatic SEO (pSEO) Content Generation

## Status: Draft

## Story

-   **As the platform operator,** I want SEO-optimized landing pages for trending markets to be generated automatically.
-   **So that** we can capture organic search traffic from users looking for specific betting opportunities.

## Acceptance Criteria

1.  A new Cloudflare Worker is created at `src/workers/pSeoGenerator-worker.ts`.
2.  The worker is configured to run on a CRON trigger (e.g., every 6 hours).
3.  The worker successfully fetches trending market data from the `polymarketService`.
4.  For each trending market, the worker calls the `aiAdapter` to generate a unique title, meta description, and a short article.
5.  The generated content (title, description, article, keywords) is successfully saved as a new entry in the `content_metadata` table in the D1 database.
6.  The worker includes appropriate error handling and logging to diagnose failures in fetching data or generating content.

## Tasks / Subtasks

-   [ ] **Task 1 (AC: #1):** Create the new worker file `src/workers/pSeoGenerator-worker.ts`.
-   [ ] **Task 2 (AC: #2):** Configure the project's `wrangler.toml` file to include a new CRON trigger that points to the `pSeoGenerator-worker`.
    ```toml
    [[triggers]]
    crons = ["0 */6 * * *"] # Every 6 hours
    ```
-   [ ] **Task 3 (AC: #3):** Implement the logic within the worker to call the `getMarkets` function from `polymarketService.ts`. Add logic to identify "trending" markets (e.g., highest volume in the last 24 hours).
-   [ ] **Task 4 (AC: #4):** For each trending market, implement a call to the `aiAdapter.generate()` function. This will require three separate calls for the title, meta description, and article body, each with a specifically crafted prompt.
-   [ ] **Task 5 (AC: #5):** Implement the database insertion logic. The worker must use the D1 client to `INSERT` the generated content into the `content_metadata` table.
-   [ ] **Task 6 (AC: #6):** Wrap the core logic in a try/catch block. On failure, log the error to the Cloudflare Workers dashboard for debugging.

## Dev Notes

### Technical Guidance from `docs/architecture.md`

*   **Worker Environment:** Cloudflare Workers have a specific environment. You cannot directly share code with the Next.js app without a proper monorepo setup (which we have). Ensure imports from services like `polymarketService` and `aiAdapter` are correctly resolved.
*   **AI Adapter:** The `aiAdapter` is designed to be the single point of contact for LLM interactions. The worker **must not** call an LLM API directly. It must go through the adapter, which handles provider-specific logic.
*   **Database Client:** In the worker context, the D1 database binding is accessed via the `env` object provided to the worker's handler (e.g., `env.DB`).
*   **Idempotency:** The worker should be designed to be idempotent. If it runs and fails, running it again should not create duplicate content. It should first check if content for a specific trending market already exists in the D1 table before generating new content.

### Testing

*   **Unit Tests:** Create `tests/unit/pSeoGenerator.test.ts`.
    *   Mock the `polymarketService` to return a sample list of markets.
    *   Mock the `aiAdapter` to return sample generated text.
    *   Mock the D1 database client.
    *   Assert that the D1 client's `prepare` and `bind` methods are called with the correct SQL query and the generated content.
*   **Manual Test Steps:**
    1.  Use the Wrangler CLI to run the worker locally: `wrangler dev`.
    2.  Trigger the worker manually via its local endpoint.
    3.  Check the console logs to ensure there are no errors.
    4.  Query the local D1 database to verify that new rows have been added to the `content_metadata` table.

## Dev Agent Record

### Agent Model Used:

### Completion Notes List

### Change Log

| Date       | Version | Description | Author |
| :---       | :---    | :---------- | :----- |
