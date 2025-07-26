# Quantum Nexus v2.0 - Refined Execution Plan

**Status:** ACTIVE | **Version:** 2.1 | **Date:** 2025-07-26

## Overview
This is the definitive, prioritized execution plan for Quantum Nexus v2.0. It is aligned with System Directive 20250712-A and front-loads all critical risk mitigation.

---

### **Phase 1: Foundation & Remediation (CRITICAL)**
*Goal: Address all critical security and data integrity risks before writing any new feature code.*

1.  **Security Hardening (Urgent):**
    - [ ] Implement Particle Network token verification to replace mock authentication.
    - [ ] Audit all API endpoints and convert all SQL queries to use parameterized inputs to eliminate injection risks.
    - [ ] Implement input validation (e.g., wallet address format) on all public-facing API endpoints.
    - **Reference:** `docs/api_security_report.md`

2.  **Database Migration Safety:**
    - [ ] Implement a schema version tracking table.
    - [ ] Convert `infra/d1/schema_v2.sql` into a series of idempotent, incremental migration scripts.
    - [ ] Add the recommended performance indexes.
    - **Reference:** `docs/migration_safety_report.md`

3.  **Documentation Cleanup:**
    - [ ] Create an `_archive` directory inside the `docs` folder.
    - [ ] Move `docs/project_brief.md` (the old version) and any other conflicting/obsolete documents into the `_archive` directory.

---

### **Phase 2: Core Refactoring & Feature Implementation**
*Goal: Build the core user experience on a secure and stable foundation.*

1.  **Smart Contract Refactoring:**
    - [ ] Update `CrossChainSettlement.sol` to handle `bytes` for omnichain addresses.
    - [ ] Refactor `PolymarketAdapter.sol` to be a simple, secure dispatcher.
    - **Reference:** `docs/stories/story.1.1.md`

2.  **Backend Service Overhaul:**
    - [ ] Update `zetaChainService.ts` and `polymarketService.ts` for omnichain support and production readiness.
    - **Reference:** `docs/stories/story.1.2.md`

3.  **Implement Seamless Onboarding:**
    - [ ] Integrate Particle Network ConnectKit for social login and Smart Wallet creation.
    - [ ] Build the "First Play Free" credit system based on the `credit_config` table.
    - **Reference:** `docs/stories/story2.1.md`

4.  **Build Core UI:**
    - [ ] Develop the `MarketList.tsx` and `TournamentBracket.tsx` components.
    - **Reference:** `docs/ux-specs/*.md`

---

### **Phase 3: Growth Engine & UX Enhancements**
*Goal: Activate automated marketing and improve user retention.*

1.  **AI Marketing Engine:**
    - [ ] Build the Cloudflare Worker and Queue infrastructure for the `pSeoGenerator` and `socialPoster`.
    - [ ] Create the `aiAdapter.ts` service with a flexible interface to support the future third-party social posting tool.

2.  **Session Keys & Smart Bets:**
    - [ ] Integrate Particle Network's Session Keys for a "one-click play" experience.
    - [ ] Implement the "Smart Bet" UI and API endpoint.
