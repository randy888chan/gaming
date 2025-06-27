# Quantum Nexus Product Requirements Document (PRD) - v1.1 (PO Validated)

## Goals and Background Context

### Goals

*   **Rapid User Acquisition:** Achieve 10,000 Monthly Active Users (MAUs) within 6 months, driven by aggressive viral marketing and pSEO strategies.
*   **Viral Coefficient:** Attain a K-factor of 0.4 or higher, demonstrating powerful user-driven growth.
*   **Self-Funding Operation:** Reach a state where automated protocol revenue covers all non-labor operational costs within 12 months, validating our lean startup model.
*   **Global Reach:** Launch with 10-language UI support to capture a global audience from day one.
*   **Deliver "Wow" Factor:** Establish a new standard for dApp user experience through an immersive, visually stunning, and highly performant interface.

### Background Context

The decentralized application landscape is functionally powerful but often fails on user experience and accessibility. "Quantum Nexus" addresses this by building an omnichain entertainment hub on the robust foundation of the `bankkroll-gamba-v2-next.js` project. Our competitive edge will be defined by three pillars: a radically simple user experience via Particle Network, a self-propelling viral growth engine powered by AI, and a feature-rich, multi-chain product offering that includes the full Gamba gaming suite and complete Polymarket betting functionality, all unified by ZetaChain's omnichain technology.

### Change Log

| Date       | Version | Description                   | Author |
| :--------- | :------ | :---------------------------- | :----- |
| 2025-06-27 | 1.1     | PO validation changes integrated. | Sarah  |

## Requirements

### Functional

*   **FR1:** The system shall support user onboarding via social logins (e.g., Google) powered by Particle Network, which must create a self-custodial wallet for the user in the background.
*   **FR2:** The system shall offer a one-time, micro-value "First Play Free" credit to new users upon successful social login and wallet creation.
*   **FR3:** The system shall feature a gamified referral system with user tiers and a public leaderboard to track referral performance.
*   **FR4:** The system shall provide a "Share a Bet" feature, allowing users to generate and share a direct link to a game with their winning parameters pre-filled.
*   **FR5:** The system shall integrate the **full suite of available Gamba games**, with each game fully reskinned to match the "Hyperspace Gateway" UI theme.
*   **FR6:** The system must provide **full Polymarket betting functionality**. This includes users being able to discover markets, analyze odds, place bets, and view their open positions within the Quantum Nexus interface.
*   **FR7:** The system shall programmatically generate SEO-optimized landing pages by pulling data from timely, "headliner" events on Polymarket.
*   **FR8:** The system shall automatically post links to new pSEO pages on social media platforms (X, Facebook), accompanied by a unique, AI-generated image.
*   **FR9:** A simple, one-click "Smart Bet" AI suggestion feature (powered by the AI Service Adapter) shall be available on all integrated Gamba game pages.
*   **FR10:** The application must be configurable as a Progressive Web App (PWA) and deployable as a Telegram Mini App.
*   **FR11:** The application UI shall support localization for at least 10 languages from launch.
*   **FR12:** The backend architecture must feature a swappable "AI Service Adapter" to allow for using different LLMs for different tasks (e.g., Mistral for text, Gemini for images).

### Non-Functional

*   **NFR1:** All infrastructure (Cloudflare, Vercel, AI APIs) must be designed to operate within free or near-zero-cost tiers for the first 6 months to align with our lean operational model.
*   **NFR2:** The "Time to Wow" (from landing page to first on-chain interaction) must be under **3 minutes** for a new user.
*   **NFR3:** All primary UI animations and page transitions must maintain a consistent 60 FPS on modern desktop and mobile devices.
*   **NFR4:** The pSEO engine and its underlying data structures must be architected to scale to generating and serving thousands of pages without a significant increase in manual oversight or cost.
*   **NFR5:** The core architecture must be modular to support planned post-MVP integrations, such as THORChain for cross-chain swaps, without requiring a major refactor.
*   **NFR6:** The system must implement a caching layer (e.g., Cloudflare KV) for Polymarket data to ensure UI performance and gracefully handle external API downtime.

## User Interface Design Goals

### Overall UX Vision
The UI/UX is a core product feature. Our vision is to create a visually stunning and immersive "Hyperspace Gateway" that feels less like a traditional dApp and more like a high-tech, futuristic control center for decentralized entertainment. The experience must be fluid, empowering, and intuitive, designed to drive retention and viral sharing.

### Key Interaction Paradigms
*   **Fluidity & Impact:** Every user action, from a button click to a page transition, must be met with a polished, meaningful animation (e.g., "energy pulse" on click, "Hyperspace Jump" transitions).
*   **Intelligent Simplicity:** Complex underlying features, especially AI-driven suggestions and cross-chain operations, must be presented to the user as simple, one-click actions.
*   **Digital Esoterica:** We will embrace a unique visual style that blends futuristic and esoteric motifs to create a distinct and memorable brand identity.

### Core Screens and Views
*   **Homepage (The Cosmic Nexus Hub):** Features a central, interactive 3D **"Nexus Orb"** for navigation and animated **"Insight Shards"** (Game/Market Cards).
*   **Game Play Pages (The "Probability Tunnel"):** Immersive, game-specific themes with a sleek **"Control Console"** for wagers.
*   **pSEO Landing Pages:** Conversion-focused pages featuring the animated **"Interception Portal"** for lead capture.

### Branding
*   **Palette:** "Cosmic Bloom," featuring a dark "Deep Space" background (#0A0B12), accented with "Quantum Violet" (#8851FF), "Electric Cyan" (#00FFFF), and "Neon Charge" Yellow (#FFEC63).
*   **Metaphors:** "Quantum Nexus," "Hyperspace Jump," "Insight Shards."
*   **Theming Strategy:** The MVP will launch exclusively with a **dark theme**. A high-contrast light theme is a high-priority feature for post-launch development.

### Target Device and Platforms
The design must be fully responsive for web, function flawlessly as a **Progressive Web App (PWA)**, and be optimized for the **Telegram Mini App** environment.

## Technical Assumptions

### Repository Structure: Monorepo
The project will be developed within the existing `bankkroll-gamba-v2-next.js.git` **monorepo**. A `workers/` directory will house Cloudflare Worker code, and an `infra/` directory will store D1 database schemas.

### Service Architecture: Serverless-First
The application will be built on a **serverless-first architecture** on the Cloudflare ecosystem (Pages, Workers, D1) for scalability and cost-effectiveness.

### Testing Requirements
*   **Unit Tests:** Mandatory for all new, non-trivial business logic (AI adapter, referral logic, fee structures).
*   **E2E (End-to-End) Tests:** Must cover the full user journey for "First Play Free" onboarding, a Gamba game lifecycle, and a Polymarket betting lifecycle.
*   **Visual Regression Tests:** Required for key UI components to prevent design degradation.

### Swappable AI Engine
The architecture will feature a swappable **AI Service Adapter** (`src/services/aiAdapter.ts`) to abstract interactions with third-party AI providers like Mistral and Gemini.

## Epics

### Epic 1: The "Flash" Foundation & Core Infrastructure

**Goal:** Establish foundational infrastructure, deploy the application to Cloudflare, and implement the complete "Hyperspace Gateway" UI reskin to deliver the core "flash" experience.

#### Story 1.1: Environment Setup & Cloudflare Deployment
As a developer, I want to deploy the existing `bankkroll-gamba-v2-next.js` project to Cloudflare Pages and connect a Cloudflare D1 database, so our foundational infrastructure is live.
**Acceptance Criteria:**
*   1: The stock project is successfully deployed to a Cloudflare Pages environment.
*   2: A D1 database is created and the initial schema (`leads`, `user_preferences`, `content_metadata`) is applied.
*   3: A health check API route (`/api/health`) confirms successful database connection.

#### Story 1.2: Immersive UI Reskin
As a user, I want to experience the "Cosmic Bloom" color palette and unique "Hyperspace Gateway" animations, so the platform feels premium and exciting from my first visit.
**Acceptance Criteria:**
*   1: The application's color scheme and typography are updated to match the "Cosmic Bloom" style guide across all existing pages.
*   2: Page transitions are replaced with the "Hyperspace Jump" animation.
*   3: All existing `GameCard.tsx` components are replaced with the new multi-layered, animated "Insight Shard" component.
*   4: The Next.js application is configured as a PWA via `next.config.mjs` and a basic wrapper for the Telegram Mini App is created.

---

### Epic 2: The Omnichain & Social Onboarding Engine

**Goal:** Integrate Particle Network for frictionless social logins and implement the "First Play Free" credit system to drive user adoption.

#### Story 2.1: Particle Network Social Login Integration
As a new user, I want to sign up with my social account (e.g., Google), so I can access the platform without needing to manage a crypto wallet myself.
**Acceptance Criteria:**
*   1: Particle Network is integrated as the primary authentication method.
*   2: A "Sign in with Social" button is the main call-to-action for unauthenticated users.
*   3: A successful social login creates a self-custodial wallet for the user and updates the UI to a "connected" state.
*   4: The user's wallet address is stored in the `useUserStore` (Zustand) for global access.
*   5: The UI must verify that the wallet state from Particle has fully propagated before enabling any features that require a wallet connection (e.g., the "First Play Free" button).

#### Story 2.2: "First Play Free" API & User Flow
As a new user who just signed up, I want to receive a "First Play Free" credit, so I can try a game immediately without any risk.
**Acceptance Criteria:**
*   1: A `POST /api/first-play-free` API route is created.
*   2: This API route verifies the user's token, checks if they've already claimed the credit in D1, and creates a user record if one doesn't exist.
*   3: Upon first successful login, the frontend calls this API.
*   4: If successful, a one-time, micro-value credit is programmatically assigned to the user's session, and the `hasClaimedFirstPlay` flag is set in the `useUserStore` and D1 database.

---

### Epic 3: The Gamba Gaming Suite Integration

**Goal:** Fully integrate the entire suite of Gamba games into the new UI, connecting them to the user's session and the "Smart Bet" AI feature.

#### Story 3.1: Integrate Gamba Games with New UI
As a user, I want to see and play all available Gamba games within the new "Hyperspace Gateway" interface.
**Acceptance Criteria:**
*   1: The `GameGrid.tsx` component is populated with all games from `src/games/index.tsx`.
*   2: Clicking an "Insight Shard" (Game Card) correctly navigates the user to the corresponding game page.
*   3: Each game page (`/play/[gameId]`) correctly renders the selected game with the new UI theme.
*   4. All game interactions (wager inputs, play buttons) use the new, reskinned UI components.

#### Story 3.2: "Smart Bet" AI Feature MVP
As a user playing a Gamba game, I want a "Smart Bet" button that gives me a simple, AI-powered bet suggestion, so I can play with more confidence.
**Acceptance Criteria:**
*   1: A `SmartBetPanel.tsx` component is added to all Gamba game pages.
*   2: The component features a single button that calls a `POST /api/smart-bet` API route, sending the `gameId` and user's `riskProfile`.
*   3: The API route uses the "Swappable AI Engine" to call Mistral AI and get a simple bet suggestion (amount, multiplier).
*   4. The suggestion is clearly displayed to the user in the `SmartBetPanel`.

---

### Epic 4: The Polymarket Integration & Betting Engine

**Goal:** Build the complete, end-to-end Polymarket betting functionality, allowing users to bet on prediction markets from the Quantum Nexus interface.

#### Story 4.1: (New Enabler Story) Deploy and Verify Polymarket Betting Contracts
As a developer, I need the EVM smart contracts for Polymarket betting to be developed, deployed, and verified on-chain, so the frontend team has a stable and secure interface to build against.
**Acceptance Criteria:**
*   1: The **Smart Contract Agent** develops Solidity contracts for interacting with the Polymarket protocol.
*   2: The contracts are successfully deployed to the target EVM testnet.
*   3: The contract addresses and ABIs are documented and made available to the frontend team.
*   4: **This story is a BLOCKER for all other stories in Epic 4.**

#### Story 4.2: Polymarket Market Discovery UI
As a user, I want to browse and view active prediction markets from Polymarket within a dedicated section of the app.
**Acceptance Criteria:**
*   1: A new page is created at `/polymarket`.
*   2: This page uses the `polymarketService.ts` to fetch and display a list of active markets.
*   3: The UI displays key information for each market: question, options, current odds/prices, and volume.
*   4: The UI is consistent with the "Hyperspace Gateway" theme.

#### Story 4.3: EVM Wallet & Betting Contract Integration
As a user, I want to connect my EVM wallet (via Particle) and place a bet on a Polymarket market.
**Acceptance Criteria:**
*   1: The frontend can trigger EVM-specific interactions using the Particle Network wallet.
*   2: The UI allows a user to select a market outcome and enter a wager amount.
*   3: Clicking "Place Bet" initiates the correct on-chain transaction by calling the deployed smart contract from Story 4.1.

#### Story 4.4: User Position & History Display
As a user, I want to see my open positions and a history of my past bets on Polymarket.
**Acceptance Criteria:**
*   1: A new "My Positions" tab is added to the `/profile` page.
*   2: This section fetches and displays the user's open bets and resolved bet history from the Polymarket protocol.
*   3: The display clearly shows the market, the user's chosen outcome, the amount wagered, and the current or final result.

---

### Epic 5: The Viral Growth & AI Content Engine

**Goal:** Implement the gamified referral system and the automated pSEO and social posting engine to drive viral growth.

#### Story 5.1: Gamified Referrals & "Share a Bet"
As a user, I want to be rewarded for bringing friends to the platform and easily share my exciting wins.
**Acceptance Criteria:**
*   1: The existing referral logic in `src/referral/` is connected to a new UI component on the `/profile` page that displays the user's referral link and stats.
*   2: After a winning play on a Gamba game, a "Share this Bet" button appears in the results modal, which generates a unique referral link to that game with the winning parameters.

#### Story 5.2: AI Content & Image Generation Engine
As a developer, I want to build a Cloudflare Worker that can generate pSEO landing pages with unique text and images, so we can automate content marketing.
**Acceptance Criteria:**
*   1: A Cloudflare Worker is created in `workers/pSeoGenerator`, triggered by a daily cron job.
*   2: The worker fetches a "headliner" event from Polymarket's data feed.
*   3: It calls the AI Service Adapter to generate SEO text (Mistral) and a relevant image (Gemini).
*   4: The generated content and image URL are stored as a new entry in the `content_metadata` D1 table.

#### Story 5.3: Automated Social Posting
As a marketer, I want new pSEO pages to be automatically posted to X and Facebook to capture event-driven traffic instantly.
**Acceptance Criteria:**
*   1: A Cloudflare Worker is created in `workers/socialPoster`, triggered by new entries in the `content_metadata` table.
*   2: The worker posts a link to the new page (e.g., `/games/seo/[slug]`) along with its AI-generated image and a text caption to both X and a Facebook Page.
*   3: The resulting social media post IDs are saved back to the corresponding `content_metadata` entry in D1.
