# Consolidated Project Blueprint: Quantum Nexus v1.0

### **1. Vision & Core Pillars**

**Vision:** To build a unified, viral decentralized application (dApp) that seamlessly integrates Web3 gaming and prediction markets.

**The Four Pillars (Non-Negotiable):**
1.  **Gamba v2:** The foundational gaming platform.
2.  **Polymarket:** The exclusive provider for prediction markets.
3.  **ZetaChain:** The exclusive omnichain layer for all cross-chain functionality (EVM, Solana, TON).
4.  **Particle Network:** The exclusive service for user onboarding and social login.

### **2. Core Technology Stack**

This is the definitive technology stack. No other technologies shall be used for these core functions.

| Category               | Technology                                 | Justification                                                         |
| ---------------------- | ------------------------------------------ | --------------------------------------------------------------------- |
| **Frontend**           | Next.js                                    | High-performance React framework for server-rendered applications.    |
| **UI Framework**       | Tailwind CSS                               | Utility-first CSS for rapid, custom UI development.                   |
| **UI Components**      | shadcn-ui                                  | Accessible and customizable component library.                        |
| **State Management**   | Zustand                                    | Lightweight state management for a performant application.            |
| **Backend & Deployment** | Cloudflare (Pages, Workers, D1, R2)        | Unified, serverless, globally distributed infrastructure.             |
| **Database**           | Cloudflare D1                              | Serverless SQL database integrated with Cloudflare Workers.           |
| **Onboarding & Wallets** | Particle Network                           | Frictionless social login and self-custodial wallet infrastructure.   |

### **3. The Implementation Roadmap (Phased)**

This is the mandatory, sequential plan. No phase begins until the previous one is complete and validated.

---

#### **Phase 1: Foundation & Remediation (Immediate Focus)**
*Objective: Fix the broken foundation. All work must address these critical issues before any new features are built.*

1.  **Fix Core Smart Contracts:**
    *   **`PolymarketAdapter.sol`:**
        *   Implement mandatory **TON** and **Solana** integration hooks.
        *   Replace the placeholder/simulation logic in the `placeBet` function with production-ready code.
        *   Optimize the `onZetaMessage` function to be more gas-efficient.
    *   **`CrossChainSettlement.sol`:**
        *   Refactor to ensure full compliance with the latest ZetaChain universal contract standards.

2.  **Finalize Database Schema:**
    *   **`infra/d1/schema.sql`:**
        *   Add required tables for Polymarket market data and ZetaChain transaction logging.
        *   Refactor the `user_preferences` table to use a universal user ID from Particle Network instead of a single `walletAddress`.

3.  **Implement Backend Services:**
    *   **`polymarketService.ts`:**
        *   Implement production-ready functions for fetching market data and submitting bets via the `PolymarketAdapter`.
    *   **`zetaChainService.ts`:**
        *   Remove all hardcoded testnet configurations.
        *   Implement production-ready functions for interacting with the `CrossChainSettlement` contract on all supported chains.

---

#### **Phase 2: Core Feature Implementation**
*Objective: Build the primary user-facing features on the now-stable foundation.*

1.  **User Onboarding:** Implement the full Particle Network social login flow.
2.  **"First Play Free":** Implement the backend logic and API for the new user credit system.
3.  **Polymarket UI:** Build the frontend components to display and interact with Polymarket markets.
4.  **Tournament Engine:** Build the backend APIs and frontend UI for creating and managing tournaments.

---

#### **Phase 3: AI Growth Engine**
*Objective: Activate the automated marketing and user engagement features.*

1.  **pSEO Worker:** Implement and deploy the Cloudflare Worker for generating SEO content.
2.  **Social Poster Worker:** Implement and deploy the Cloudflare Worker for automated social media posting.
3.  **Smart Bet AI:** Integrate the AI adapter to provide in-game bet suggestions.
