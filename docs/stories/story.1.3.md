# Story 1.3: Implement Safe & Performant Database Schema

**Epic:** 1: Foundation & Remediation
**Status:** Approved
**Priority:** CRITICAL

## User Story
- **As:** a developer and system administrator,
- **I want:** a robust, version-controlled, and performant database schema,
- **So that:** we can deploy changes safely, prevent data loss, and ensure the application scales effectively.

## Definition of Ready
- [x] `docs/migration_safety_report.md` has been analyzed and its findings are the basis for this story.
- [x] The definitive schema is defined in `infra/d1/schema_v2.sql`, which will serve as the source for our migration scripts.
- [x] Access to the Cloudflare D1 database for development and staging is confirmed.

## Acceptance Criteria
1.  **Non-Destructive Migrations:** The initial `schema_v2.sql` file is broken down into incremental, non-destructive migration scripts. The `DROP TABLE` statements are removed and replaced with `CREATE TABLE IF NOT EXISTS`.
2.  **Version Tracking is Implemented:** A `schema_migrations` table is created and managed by the migration tool (e.g., `wrangler d1 migrations`). Every schema change is recorded.
3.  **Performance Indexes are Created:** The following indexes are successfully created to prevent full table scans on common queries:
    -   An index on `user_preferences(particle_user_id)`.
    -   An index on `polymarket_markets_cache(is_active)`.
    -   An index on `zetachain_cctx_log(status)`.
4.  **Data Types are Corrected:** The `amount` column in the `zetachain_cctx_log` table is changed from `TEXT` to a numeric type (`REAL` or `NUMERIC`) to allow for proper calculations.
5.  **Legacy Schema is Removed:** The old migration file at `infra/d1/migrations/001_create_user_profiles_table.sql` is deleted from the repository.

## Technical Guidance
This story addresses critical data integrity and performance issues.

-   **Migration Strategy:**
    -   Use the built-in `wrangler d1 migrations` command, which is the standard for Cloudflare D1.
    -   Create a `migrations` folder inside `infra/d1/`.
    -   The first migration file should be named `0000_initial_schema.sql` and will contain the `CREATE TABLE IF NOT EXISTS` statements from `schema_v2.sql`. **Do not include `DROP TABLE` statements.**

-   **Schema Versioning Table:**
    -   The `wrangler d1 migrations` tool automatically creates and manages a `d1_migrations` table. No manual creation is needed.

-   **Index Creation (Example Migration `0001_add_performance_indexes.sql`):**
    ```sql
    -- Add indexes for common query patterns
    CREATE INDEX IF NOT EXISTS idx_user_preferences_particle_id ON user_preferences(particle_user_id);
    CREATE INDEX IF NOT EXISTS idx_polymarket_markets_active ON polymarket_markets_cache(is_active);
    CREATE INDEX IF NOT EXISTS idx_cctx_status ON zetachain_cctx_log(status);
    ```

-   **Data Type Correction (Example Migration `0002_fix_cctx_log_amount_type.sql`):**
    -   D1 does not support `ALTER COLUMN TYPE` directly. This requires a multi-step migration:
    1.  Create a new table with the correct schema.
    2.  Copy data from the old table to the new one.
    3.  Drop the old table.
    4.  Rename the new table to the original name.
    ```sql
    -- Step 1: Create new table with correct type
    CREATE TABLE zetachain_cctx_log_new (
        cctx_hash TEXT PRIMARY KEY NOT NULL,
        source_chain TEXT NOT NULL,
        destination_chain TEXT NOT NULL,
        asset TEXT,
        amount REAL, -- Corrected data type
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Step 2: Copy data, casting amount
    INSERT INTO zetachain_cctx_log_new SELECT cctx_hash, source_chain, destination_chain, asset, CAST(amount AS REAL), status, created_at, updated_at FROM zetachain_cctx_log;

    -- Step 3: Drop the old table
    DROP TABLE zetachain_cctx_log;

    -- Step 4: Rename the new table
    ALTER TABLE zetachain_cctx_log_new RENAME TO zetachain_cctx_log;
    ```
-   **Cleanup:**
    -   After creating the new migration files, delete `infra/d1/schema_v2.sql` as its contents will now live in the versioned migration scripts.
    -   Delete `infra/d1/migrations/001_create_user_profiles_table.sql`.
