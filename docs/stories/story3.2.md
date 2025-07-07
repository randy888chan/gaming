# Story 3.2: Automated Social Posting

## Status: Draft

## Story

-   **As the platform operator,** I want links to newly created content and major platform events to be posted to our social media channels automatically.
-   **So that** we can increase our reach and drive user acquisition without manual effort.

## Acceptance Criteria

1.  A new Cloudflare Worker is created at `src/workers/socialPoster-worker.ts`.
2.  The worker is configured to be triggered whenever a new row is inserted into the `content_metadata` table in the D1 database.
3.  Upon triggering, the worker retrieves the `title` and `urlPath` from the new row.
4.  The worker constructs a formatted post for Twitter/X (e.g., "New Prediction Market Live: {title} - Bet now! {url}").
5.  The worker successfully makes an API call to the Twitter API to post the content.
6.  The worker handles potential API errors gracefully and includes logging for debugging.

## Tasks / Subtasks

-   [ ] **Task 1 (AC: #1):** Create the new worker file `src/workers/socialPoster-worker.ts`.
-   [ ] **Task 2 (AC: #2):** Configure the D1 database and Cloudflare to trigger this worker on new `content_metadata` entries. This may involve using a technology like Cloudflare Queues or a direct D1 binding trigger if available. *Developer Note: Research the current best practice for D1->Worker triggers.*
-   [ ] **Task 3 (AC: #3, #4):** Implement the logic within the worker to parse the trigger event data and extract the new content's details. Construct the text for the social media post.
-   [ ] **Task 4 (AC: #5):** Integrate a Twitter API client/library (e.g., `twitter-api-v2`) or use a direct `fetch` call to the Twitter API v2 `tweets` endpoint to post the content.
-   [ ] **Task 5 (AC: #6):** Store the required Twitter API credentials (API Key, Secret, Access Token, etc.) as secure secrets in the Cloudflare Worker settings, accessible via `env`. Implement try/catch blocks for the API call and log any failures.

## Dev Notes

### Technical Guidance from `docs/architecture.md`

*   **Secrets Management:** Twitter API keys are highly sensitive. They **MUST NOT** be hardcoded. They must be configured as encrypted secrets using the Cloudflare dashboard or `wrangler secret put`.
*   **Trigger Mechanism:** The ideal architecture is event-driven. A direct database trigger is preferred. If this is not natively supported by D1, the alternative is to have the `pSeoGenerator-worker` push a message to a Cloudflare Queue, which the `socialPoster-worker` consumes. The developer should investigate and implement the most robust solution available.
*   **External API Calls:** Workers use the standard `fetch` API for outbound requests. Ensure that all necessary `Authorization` headers and request body formats comply with the Twitter API v2 documentation.

### Testing

*   **Unit Tests:** Create `tests/unit/socialPoster.test.ts`.
    *   Mock the trigger event data.
    *   Mock the `fetch` call to the Twitter API.
    *   Assert that `fetch` is called with the correct URL, headers, and a properly formatted request body containing the content from the mock event.
*   **Manual Test Steps:**
    1.  Deploy the worker to a staging environment using `wrangler deploy`.
    2.  Configure the staging worker with test Twitter API credentials.
    3.  Manually insert a new row into the staging D1 `content_metadata` table.
    4.  Check the configured test Twitter account to verify that a new post has appeared with the correct title and link.
    5.  Check the worker's logs in the Cloudflare dashboard to ensure there are no errors.

## Dev Agent Record

### Agent Model Used:

### Completion Notes List

### Change Log

| Date       | Version | Description | Author |
| :---       | :---    | :---------- | :----- |
