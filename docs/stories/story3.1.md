# Story 3.1: Implement AI Marketing Workers with Queues

**Epic:** 3: AI Growth Engine & UX Enhancements
**Status:** Approved

## User Story

- **As an operator,** I want an automated system to generate and post marketing content in a resilient, decoupled manner,
- **So that** a failure in one part of the system (e.g., social media posting) does not halt the entire content generation pipeline.

## Acceptance Criteria

1.  **pSEO Worker Created:** A new Cloudflare Worker is created at `src/workers/pSeoGenerator-worker.ts`.
2.  **Worker Logic Implemented:** The worker runs on a CRON schedule, fetches trending markets from `polymarketService`, generates content using the `aiAdapter`, and saves the final content to the `content_metadata` table in D1.
3.  **Queue Integration:** Upon successfully saving content to D1, the `pSeoGenerator-worker` **must** push a JSON message containing the `content_id` and `title` to a designated Cloudflare Queue.
4.  **Social Poster Worker Created:** A new Cloudflare Worker is created at `src/workers/socialPoster-worker.ts`.
5.  **Queue Trigger Configured:** The `socialPoster-worker` is configured to be triggered by new messages on the Cloudflare Queue. It consumes the message, fetches the full content details from D1 using the `content_id`, and posts it to social media.

## Tasks / Subtasks

- [ ] **Task 1 (AC #1, #2):** Implement the `pSeoGenerator-worker.ts` logic and configure its CRON trigger in `wrangler.toml`.
- [ ] **Task 2 (AC #3):** Provision a Cloudflare Queue and implement the logic in the pSEO worker to enqueue a message upon success.
- [ ] **Task 3 (AC #4, #5):** Implement the `socialPoster-worker.ts` logic and configure it to be triggered by the queue.
- [ ] **Task 4:** Add robust error handling to both workers. If the social poster fails, it should utilize the queue's native retry/dead-letter queue functionality.

## Dev Notes

- This architecture is a critical improvement for system resilience. The queue acts as a buffer, ensuring that even if the Twitter API is down, the content generation is not affected, and posting can be retried automatically.
- All external API credentials (e.g., for Twitter) **must** be stored as encrypted secrets in the Cloudflare Worker environment.
