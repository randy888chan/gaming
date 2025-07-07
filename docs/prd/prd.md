# Product Requirements Document: Quantum Nexus v1.4 (Definitive Edition)

**Document Status:** Final | **Version:** 1.4 | **Date:** 2025-07-07

## 1. Vision & Core Principles

**Vision:** To build a unified, viral decentralized application (dApp) that seamlessly integrates Web3 gaming and prediction markets, made accessible to everyone through a frictionless, "flash and viral" Web2-like user experience.

**Core Principles:**
*   **User-Centric Simplicity:** Hide all non-essential blockchain complexity. The user journey for onboarding and basic play should feel as simple as a modern web application.
*   **Maximum Abstraction:** Fully leverage the capabilities of our chosen dependencies (ZetaChain, Particle Network) to minimize bespoke, complex code and reduce our security surface. We build *on top* of them, not *around* them.
*   **Singular Logic:** Our core cross-chain business logic will reside in a **single smart contract on the ZetaChain zEVM** to ensure consistency, security, and ease of upgrades.
*   **Lean Infrastructure:** The entire platform will run on the **Cloudflare serverless ecosystem** (Pages, Workers, D1, R2) for global scalability and maximum cost-efficiency.

## 2. The Four Pillars (Non-Negotiable Dependencies)

The project's success is predicated on the expert integration of these four technologies.

1.  **Gamba v2:** The foundational SDK and protocol for all on-chain casino-style gaming.
2.  **Polymarket:** The exclusive source and settlement layer for all prediction markets, accessed via their CLOB API.
3.  **ZetaChain:** The exclusive omnichain layer for all cross-chain functionality, enabling our **Universal App** architecture.
4.  **Particle Network:** The exclusive **Wallet-as-a-Service (WaaS)** provider for user onboarding, social login, Smart Wallet creation, and gas fee sponsorship (Paymaster).

## 3. The Complete Project Roadmap: User Epics & Stories

This is the definitive, phased implementation plan for the entire project lifecycle.

---

### **Epic 1: The Frictionless Foundation & Core Revenue**
*Goal: To establish a rock-solid, simplified foundation that provides an instant "Time to Wow" for new users and correctly configures our primary revenue streams.*

*   **Story 1.1: Seamless Social Onboarding & Gasless First Play**
    *   **As a new user,** I want to sign up with one click using my social account (e.g., Google, X).
    *   **So that** I can immediately access the platform without needing to understand or manage a crypto wallet.
    *   **And** I want my first few game plays to be completely free and instant, without any gas fee pop-ups or network error messages.
    *   **Acceptance Criteria:**
        *   Integrates `@particle-network/connectkit` SDK.
        *   A successful social login creates a self-custodial Smart Wallet for the user.
        *   The Particle Network Paymaster is configured to sponsor the gas fees for the first **2** on-chain transactions for any new user wallet.
        *   The legacy `/api/first-play-free` endpoint and all related database logic are **removed**.

*   **Story 1.2: Implement Platform Revenue & Gamba Liquidity Provision**
    *   **As the platform operator,** I want to automatically collect a small fee from every game played to ensure the platform is profitable.
    *   **And as a user,** I want to be able to deposit my tokens into the Gamba liquidity pool to become a "part of the house" and earn yield.
    *   **Acceptance Criteria:**
        *   The `<GambaProvider>` is configured with our platform's official `creator` address and a `creatorFee` of **0.5%**.
        *   A new UI page (`/liquidity`) is created.
        *   This page displays the current total liquidity in the main Gamba pool.
        *   Users can use this interface to deposit supported tokens (e.g., USDC, SOL) into the pool.
        *   Users can use this interface to withdraw their share of the pool (burn their LP tokens).

---

### **Epic 2: The Unified dApp Experience**
*Goal: To integrate the core Polymarket and Tournament features, creating a single, powerful application on our stable foundation.*

*   **Story 2.1: Polymarket Market Integration & Betting Flow**
    *   **As a user,** I want to browse active Polymarket prediction markets and place bets directly within the Quantum Nexus UI.
    *   **So that** I can seamlessly switch between playing games and betting on real-world events.
    *   **Acceptance Criteria:**
        *   A `/polymarket` page displays markets fetched from the Polymarket CLOB API via our backend service.
        *   The UI shows outcomes and real-time prices.
        *   A "Place Bet" button on the UI initiates a call to our backend API.
        *   The backend triggers a cross-chain transaction via the `zetaChainService`, targeting the `PolymarketAdapter.sol` contract on the appropriate EVM chain. The user signs this single transaction from their Particle Smart Wallet.

*   **Story 2.2: Tournament Engine MVP**
    *   **As an administrator,** I want a simple interface to create and manage single-elimination tournaments for our supported Gamba games.
    *   **And as a user,** I want to view a real-time tournament bracket.
    *   **Acceptance Criteria:**
        *   Backend includes CRUD APIs at `/api/v1/tournaments`.
        *   An admin UI (can be basic) allows for tournament creation.
        *   A public-facing UI at `/tournaments/{id}` renders the `TournamentBracket.tsx` component with real-time data from the API.

---

### **Epic 3: The AI-Powered Growth Engine**
*Goal: To build and activate the automated marketing and user engagement features that will drive platform growth.*

*   **Story 3.1: Programmatic SEO (pSEO) Content Generation**
    *   **As the platform operator,** I want SEO-optimized landing pages for trending markets to be generated automatically.
    *   **So that** we can capture valuable organic search traffic.
    *   **Acceptance Criteria:**
        *   A Cloudflare Worker (`pSeoGenerator-worker.ts`) runs on a CRON schedule (e.g., every 6 hours).
        *   The worker fetches trending market data from our `polymarketService`.
        *   It calls the `aiAdapter` to generate a unique title, meta description, and short article.
        *   The generated content is saved to the `content_metadata` table in our D1 database.

*   **Story 3.2: Automated Social Posting**
    *   **As the platform operator,** I want links to newly created content and major platform events to be posted to social media automatically.
    *   **So that** we can increase our reach and drive user acquisition.
    *   **Acceptance Criteria:**
        *   A Cloudflare Worker (`socialPoster-worker.ts`) is triggered by new entries in the `content_metadata` table.
        *   The worker constructs a post for Twitter/X and posts it via the official Twitter API.

*   **Story 3.3: Smart Bet AI Feature**
    *   **As a user,** I want a "Smart Bet" button that gives me a simple, AI-powered bet suggestion.
    *   **So that** I can have a more engaging and confidence-inspiring betting experience.
    *   **Acceptance Criteria:**
        *   A "Smart Bet" button is available in the UI for applicable games.
        *   Clicking the button calls the `/api/smart-bet` endpoint.
        *   The endpoint returns an AI-generated suggestion (e.g., "Bet High" or "Bet Low") based on user risk profile (from D1) and recent game history.

---

### **Epic 4: Advanced Functionality & Internationalization**
*Goal: To cater to power users, expand revenue models, and prepare for a global audience.*

*   **Story 4.1: Polymarket Market Making Interface**
    *   **As an advanced user,** I want an interface to place `BUY` and `SELL` limit orders on Polymarket markets.
    *   **So that** I can act as a market maker and earn revenue from the bid-ask spread.
    *   **Acceptance Criteria:**
        *   A new "Pro Trading" page is created.
        *   This UI displays the order book for a selected market.
        *   Users can submit, view, and cancel their open limit orders.

*   **Story 4.2: Platform Internationalization (i18n)**
    *   **As a non-English speaking user,** I want to be able to use the entire platform in my native language.
    *   **So that** I can have a comfortable and intuitive user experience.
    *   **Acceptance Criteria:**
        *   The platform is fully translated into the 10 target languages: `en, es, fr, de, it, pt, ru, zh, ja, ko`.
        *   The `next-i18next` framework is correctly configured.
        *   All static UI text is sourced from the JSON translation files in `public/locales/`.
        *   A language switcher is present in the UI.
```
