# Story 3.1: Implement AI Marketing Workers with Queues

**Epic:** 3: AI Growth Engine & UX Enhancements
**Status:** Approved
**Priority:** HIGH

## User Story
- **As:** the platform operator,
- **I want:** an automated, resilient system to generate and post marketing content,
- **So that:** we can drive organic growth and maintain a social media presence with minimal manual effort and high reliability.

## Definition of Ready
- [x] All Phase 1 and 2 stories are complete.
- [x] The Cloudflare account is configured with Worker and Queue capabilities.
- [x] AI service provider credentials are securely stored in the Cloudflare environment secrets.
- [x] The D1 database schema includes the `content_metadata` table.

## Acceptance Criteria
1.  **AI Service Adapter is Implemented:** A new service at `src/services/aiAdapter.ts` is created. It acts as a modular interface for interacting with LLMs, abstracting the specific provider logic.
2.  **pSEO Generator Worker is Functional:** A new Cloudflare Worker at `src/workers/pSeoGenerator/index.ts` is created.
    -   It is configured to run on a CRON schedule (e.g., once daily).
    -   It uses the `aiAdapter` to generate pSEO content (title, description, keywords, HTML body, and an image prompt).
    -   It stores the generated content and metadata in the `content_metadata` D1 table.
    -   Upon successful content creation, it **enqueues a message** to a designated Cloudflare Queue. The message contains the `id` of the newly created content.
3.  **Social Poster Worker is Functional:** A new Cloudflare Worker at `src/workers/socialPoster/index.ts` is created.
    -   It is configured to be **triggered by messages** from the Cloudflare Queue.
    -   It consumes the message, retrieves the corresponding content from the D1 database using the `id`.
    -   It uses the `aiAdapter` to generate a social media post variant of the content.
    -   It successfully posts the content to the target social media platform via the chosen third-party integration.
4.  **Resilience is Achieved:** The system is decoupled. A failure in the `socialPoster-worker` (e.g., a social media API is down) does not affect the `pSeoGenerator-worker`. The message remains in the queue and can be retried automatically by Cloudflare's built-in mechanisms.

## Technical Guidance

-   **Target Files for Modification/Creation:**
    -   `src/services/aiAdapter.ts` (new file)
    -   `src/workers/pSeoGenerator/index.ts` (or equivalent worker script file)
    -   `src/workers/socialPoster/index.ts` (or equivalent worker script file)
    -   `wrangler.toml` (for worker and queue configuration)

-   **`aiAdapter.ts` Implementation:**
    -   This should be a class or a set of functions that provides a simple, unified interface.
    -   **Example Interface:**
        ```typescript
        interface GenerationRequest {
          prompt: string;
          // ... other options like temperature, max_tokens
        }
        
        interface TextGenerationResponse {
          success: boolean;
          content?: string;
          error?: string;
        }

        // Functions to implement
        async function generateTextContent(req: GenerationRequest): Promise<TextGenerationResponse> { /* ... */ }
        async function generateImage(req: GenerationRequest): Promise</* ... */> { /* ... */ }
        ```

-   **`wrangler.toml` Configuration:**
    -   Define the two workers and their triggers.
    -   Define the binding for the D1 database and the Cloudflare Queue.
    ```toml
    # wrangler.toml example
    [[workers.queues]]
    binding = "SOCIAL_POST_QUEUE"
    queue_name = "social-post-queue"

    [[workers]]
    name = "pSeoGenerator"
    main = "src/workers/pSeoGenerator/index.ts"
    compatibility_date = "YYYY-MM-DD"
    d1_databases = [
      { binding = "DB", database_name = "your-d1-db-name", database_id = "..." }
    ]
    queue_producers = [
      { binding = "SOCIAL_POST_QUEUE", queue = "social-post-queue" }
    ]
    triggers = { crons = ["0 5 * * *"] } # Daily at 5 AM UTC

    [[workers]]
    name = "socialPoster"
    main = "src/workers/socialPoster/index.ts"
    compatibility_date = "YYYY-MM-DD"
    d1_databases = [
      { binding = "DB", database_name = "your-d1-db-name", database_id = "..." }
    ]
    queue_consumers = [
      { queue = "social-post-queue" }
    ]
    ```

-   **Worker Logic:**
    -   **pSEO Generator:**
        1.  CRON triggers worker.
        2.  Call `aiAdapter.generateTextContent(...)`.
        3.  Save result to D1 `content_metadata` table.
        4.  Call `env.SOCIAL_POST_QUEUE.send({ contentId: newContent.id })`.
    -   **Social Poster:**
        1.  Queue message triggers worker `queue(batch, env)` handler.
        2.  For each message in `batch.messages`:
        3.  `const contentId = message.body.contentId;`
        4.  Query D1: `SELECT * FROM content_metadata WHERE id = ?`.
        5.  Call chosen third-party social posting service API with the content.
