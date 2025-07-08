# Story 1.3: Migrate Database to Universal User ID

**Epic:** 1: Compliance & Core Refactoring
**Status:** Approved

## User Story
- **As:** The System Architect,
- **I want:** The database schema to be refactored to support multi-chain wallets and provide necessary transaction logging,
- **So that:** The platform's data layer is robust, scalable, and auditable.

## Acceptance Criteria
1.  **New Schema Created:** A new file, `infra/d1/schema_v2.sql`, is created and contains the definitive schema.
2.  **Universal User ID Implemented:** The `user_preferences` table is recreated with `particle_user_id TEXT` as its primary key, replacing the old `walletAddress`.
3.  **New Tables Added:** The schema includes two new tables:
    -   `polymarket_markets_cache`: For caching data from the Polymarket API.
    -   `zetachain_cctx_log`: For logging all cross-chain transaction hashes initiated by the platform.
4.  **API Endpoints Updated:** All API routes in `src/pages/api/` that interact with user data are updated to query using `particle_user_id` instead of a wallet address.

## Tasks / Subtasks
-   [ ] **Task 1 (AC #1):** Create the new `infra/d1/schema_v2.sql` file with the full, correct schema as defined in `docs/architecture/architecture.md`. The old schema file (`infra/d1/schema.sql`) can be deleted or archived.
-   [ ] **Task 2 (AC #2, #3):** Implement the changes in the new schema file, ensuring primary keys and table structures are correct.
-   [ ] **Task 3 (AC #4):** Identify and refactor all API endpoints (e.g., `src/pages/api/v1/users/index.ts`) that perform database lookups on the `user_preferences` table to use the new primary key.

## Dev Notes
-   This schema change is fundamental for the multi-chain vision of the project.
-   After this story is complete, all user-related data must be keyed to the universal ID provided by Particle Network upon login.
