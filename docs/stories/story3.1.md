# Story 3.1: Implement AI Marketing Workers with Queues

**Epic:** 3: AI Growth Engine & UX Enhancements
**Status:** Approved

## User Story
- **As an operator,** I want an automated system to generate and post marketing content in a resilient, decoupled manner,
- **So that** a failure in one part of the system does not halt the entire content generation pipeline.

## Acceptance Criteria
1.  **pSEO Worker Created:** A new Cloudflare Worker is created at `src/workers/pSeoGenerator-worker.ts` and runs on a CRON schedule.
2.  **Queue Integration:** Upon successfully generating content, the `pSeoGenerator-worker` pushes a message to a designated **Cloudflare Queue**.
3.  **Social Poster Worker Created:** A new Cloudflare Worker is created at `src/workers/socialPoster-worker.ts`.
4.  **Queue Trigger Configured:** The `socialPoster-worker` is configured to be triggered by new messages on the Cloudflare Queue, consuming them to post to social media.

## Dev Notes
- The queue is the key architectural pattern for resilience.
- All external API credentials **must** be stored as encrypted secrets in the Cloudflare Worker environment.
