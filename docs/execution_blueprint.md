# Quantum Nexus v2.0 Execution Blueprint

## Overview
This document outlines the detailed execution plan for implementing Quantum Nexus v2.0 based on the PRD, architecture, and UX specifications. The plan is organized by epic and story, with specific implementation tasks for each component.

## Epic 1: Compliance & Core Refactoring
### Story 1.1: Refactor Smart Contracts for Omnichain Support
**Objective:** Update contracts to support EVM, Solana, and TON transactions via ZetaChain.

**Implementation Steps:**
1. Update `CrossChainSettlement.sol`:
   - Change `destinationAddress` type from `address` to `bytes` in [`contracts/evm/CrossChainSettlement.sol:45`](contracts/evm/CrossChainSettlement.sol:45)
   - Implement generic dispatcher pattern by removing application-specific logic
   - Update `_withdraw` function to handle non-EVM addresses:
     ```solidity
     if (payload.recipient.length == 20) {
         // Handle EVM address
         address evmAddress = address(uint160(bytes20(payload.recipient)));
         // Transfer logic
     } else {
         // Handle non-EVM (Solana/TON) address
         // Cross-chain transfer logic
     }
     ```

2. Refactor `PolymarketAdapter.sol`:
   - Make `placeBet` only encode payload and call `CrossChainSettlement` in [`contracts/evm/PolymarketAdapter.sol:32`](contracts/evm/PolymarketAdapter.sol:32)
   - Optimize `onZetaMessage` to decode payload once
   - Add GambaToken integration with require statement

3. Create Foundry tests:
   - Test Solana address handling in [`test/evm/CrossChainSettlement.t.sol`](test/evm/CrossChainSettlement.t.sol)
   - Test TON address handling in same file

4. Update Hardhat tests for PolymarketAdapter in [`test/evm/PolymarketAdapter.test.js`](test/evm/PolymarketAdapter.test.js)

**Testing:**
- Verify transactions with Solana/TON addresses don't revert
- Ensure PolymarketAdapter only interacts with CrossChainSettlement
- Test GambaToken integration

### Story 1.2: Overhaul Backend Services
**Objective:** Make backend services production-ready with omnichain support.

**Implementation Steps:**
1. Update `zetaChainService.ts`:
   - Add Solana/TON transaction methods in [`src/services/zetaChainService.ts`](src/services/zetaChainService.ts)
   - Implement Cloudflare secrets configuration
   - Remove hardcoded testnet addresses

2. Refactor `polymarketService.ts`:
   - Use official `@polymarket/clob-client` SDK in [`src/services/polymarketService.ts`](src/services/polymarketService.ts)
   - Implement `placePolymarketBet` payload constructor

3. Security audit:
   - Scan for exposed secrets
   - Verify all sensitive data loaded from Cloudflare environment

**Testing:**
- Test transaction methods with Solana/TON destinations
- Verify Polymarket payload construction
- Confirm no secrets in codebase

### Story 1.3: Migrate Database to Universal User ID
**Objective:** Refactor database schema for multi-chain support.

**Implementation Steps:**
1. Create `schema_v2.sql`:
   - Define `particle_user_id` as primary key in [`infra/d1/schema_v2.sql`](infra/d1/schema_v2.sql)
   - Add `polymarket_markets_cache` table
   - Add `zetachain_cctx_log` table
   - Add `credit_config` table

2. Update API routes:
   - Modify all user-related endpoints to use `particle_user_id` in [`src/pages/api/**/*.ts`](src/pages/api/)

3. Delete old schema file: [`infra/d1/migrations/001_create_user_profiles_table.sql`](infra/d1/migrations/001_create_user_profiles_table.sql)

**Testing:**
- Verify new schema creates correctly
- Test API endpoints with particle_user_id
- Confirm old schema file removed

## Epic 2: The Unified dApp Experience
### Story 2.1: Implement Seamless Onboarding
**Objective:** Create frictionless onboarding with social login and first play credit.

**Implementation Steps:**
1. Create `OnboardingModal.tsx` component in [`src/components/onboarding/OnboardingModal.tsx`](src/components/onboarding/OnboardingModal.tsx)
2. Integrate Particle Network ConnectKit
3. Implement first play credit system using `credit_config` table
4. Add guided wallet setup flow

**Testing:**
- Test social login flows (Google, Twitter, etc.)
- Verify first play credit is applied correctly
- Test wallet setup process

### Story 2.2: Build Polymarket & Tournament UI
**Objective:** Create UI for Polymarket and tournament features.

**Implementation Steps:**
1. Create `MarketList.tsx` component in [`src/components/polymarket/MarketList.tsx`](src/components/polymarket/MarketList.tsx)
2. Implement `TournamentBracket.tsx` in [`src/components/tournament/TournamentBracket.tsx`](src/components/tournament/TournamentBracket.tsx)
3. Add API routes for market data and tournament management in [`src/pages/api/v1/**/*.ts`](src/pages/api/v1/)

**Testing:**
- Verify market data displays correctly
- Test tournament bracket functionality
- Ensure API endpoints return expected data

## Epic 3: AI Growth Engine & UX Enhancements
### Story 3.1: Implement AI Marketing Workers
**Objective:** Create automated content generation and posting system.

**Implementation Steps:**
1. Create `pSeoGenerator-worker.ts` in [`src/workers/pSeoGenerator/worker.ts`](src/workers/pSeoGenerator/worker.ts)
   - Implement CRON-triggered content generation
   - Enqueue messages to Cloudflare Queue

2. Create `socialPoster-worker.ts` in [`src/workers/socialPoster/worker.ts`](src/workers/socialPoster/worker.ts)
   - Consume messages from queue
   - Post to social media APIs

3. Implement `aiAdapter.ts` in [`src/services/aiAdapter.ts`](src/services/aiAdapter.ts)
   - Create unified LLM interface

**Testing:**
- Verify CRON triggers content generation
- Test message queueing and consumption
- Ensure social media posts are created correctly

### Story 3.2: Implement Session Keys & Smart Bets
**Objective:** Add session-based authentication and AI betting suggestions.

**Implementation Steps:**
1. Create `SessionManager.tsx` in [`src/components/SessionManager.tsx`](src/components/SessionManager.tsx)
   - Implement duration slider (1h/8h/24h)
   - Add auto-renew toggle
   - Create active session indicator

2. Implement session key authentication in [`lib/auth.ts`](lib/auth.ts)
3. Add "Smart Bet" suggestions in [`src/components/game/GameRenderer.tsx`](src/components/game/GameRenderer.tsx)

**Testing:**
- Test session duration and auto-renewal
- Verify authentication works with session keys
- Ensure smart bet suggestions are displayed

## Epic 4: Internationalization & Advanced Features
### Story 4.1: Platform Internationalization
**Objective:** Add support for multiple languages.

**Implementation Steps:**
1. Implement i18n framework in [`src/lib/i18n.ts`](src/lib/i18n.ts)
2. Translate UI components using locale files in [`public/locales/**/*.json`](public/locales/)
3. Add language selector in [`src/components/layout/Header.tsx`](src/components/layout/Header.tsx)

**Testing:**
- Verify all UI elements are translatable
- Test language switching functionality
- Check for missing translations

### Story 4.2: Build On-Chain Referral System
**Objective:** Implement referral program with on-chain tracking.

**Implementation Steps:**
1. Create referral contract in [`contracts/evm/ReferralSystem.sol`](contracts/evm/ReferralSystem.sol)
2. Implement referral tracking in database schema
3. Add referral UI components in [`src/components/referral/`](src/components/referral/)

**Testing:**
- Test referral contract functionality
- Verify referral tracking in database
- Ensure UI components work correctly

## Dependencies
1. Epic 1 must be completed before starting Epic 2
2. Story 1.2 (Backend services) must be completed before Story 3.1 (AI workers)
3. Story 1.3 (Database) must be completed before Story 2.1 (Onboarding)
4. Story 3.2 (Session keys) depends on Story 2.1 (Onboarding) completion

## Risk Mitigation
- **Contract Refactoring (1.1):** Extensive unit and integration testing
- **Database Migration (1.3):** Backup before migration, test with staging data
- **AI Workers (3.1):** Implement circuit breakers for API failures
- **Session Keys (3.2):** Security audit, time-bound permissions
- **Internationalization (4.1):** Use i18n framework with fallback strings
- **Referral System (4.2):** Test incentive mechanisms thoroughly

## Timeline
```mermaid
gantt
    title Quantum Nexus v2.0 Implementation Timeline
    dateFormat  YYYY-MM-DD
    section Epic 1
    Story 1.1      :2025-07-12, 5d
    Story 1.2      :2025-07-17, 4d
    Story 1.3      :2025-07-21, 3d
    section Epic 2
    Story 2.1      :2025-07-24, 4d
    Story 2.2      :2025-07-28, 4d
    section Epic 3
    Story 3.1      :2025-08-01, 5d
    Story 3.2      :2025-08-06, 4d
    section Epic 4
    Story 4.1      :2025-08-10, 4d
    Story 4.2      :2025-08-14, 4d
    section QA
    Integration Testing :2025-08-18, 5d
    User Acceptance :2025-08-23, 3d
    Launch          :2025-08-26, 1d