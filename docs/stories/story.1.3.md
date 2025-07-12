# Story 1.3: Migrate Database to Universal User ID

**Epic:** 1: Compliance & Core Refactoring
**Status:** Approved

## User Story
- **As:** The System Architect,
- **I want:** The database schema to be refactored to support multi-chain wallets and provide necessary transaction logging,
- **So that:** The platform's data layer is robust, scalable, and auditable.

## Acceptance Criteria
1.  **New Schema Created:** A new file, `infra/d1/schema_v2.sql`, is created and contains the definitive schema.
2.  **Universal User ID Implemented:** The `user_preferences` table is recreated with `particle_user_id TEXT` as its primary key.
3.  **New Tables Added:** The schema includes two new tables: `polymarket_markets_cache` and `zetachain_cctx_log`.
4.  **API Endpoints Updated:** All API routes in `src/pages/api/` that interact with user data are updated to query using `particle_user_id`.

## Dev Notes
- This schema change is fundamental for the multi-chain vision. The `particle_user_id` from Particle Network is the single source of truth for user identity.
- The old schema (`infra/d1/migrations/001_create_user_profiles_table.sql`) should be deleted.
