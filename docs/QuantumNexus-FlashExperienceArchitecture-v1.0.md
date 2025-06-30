# QuantumNexus-FlashExperienceArchitecture-v1.0.md

### **1. Introduction**

This document outlines the technical design for the 'Flash Experience & Onboarding Engine' epic, which encompasses the foundational infrastructure, immersive UI, omnichain and social onboarding, Gamba gaming suite integration, Polymarket integration, and viral growth mechanisms for the Quantum Nexus platform. The goal is to deliver a visually stunning, intuitive, and highly performant decentralized application that drives rapid user acquisition and engagement.

### **2. Goals**

The primary goals for this epic, as derived from the Product Requirements Document (PRD), are:

*   **Rapid User Acquisition:** Achieve 10,000 Monthly Active Users (MAUs) within 6 months.
*   **Viral Coefficient:** Attain a K-factor of 0.4 or higher.
*   **Self-Funding Operation:** Reach a state where automated protocol revenue covers all non-labor operational costs within 12 months.
*   **Global Reach:** Launch with 10-language UI support.
*   **Deliver "Wow" Factor:** Establish a new standard for dApp user experience.
*   **"Time to Wow"**: Under 3 minutes from landing page to first on-chain interaction.

### **3. High-Level Architecture**

The Quantum Nexus platform will leverage a serverless-first architecture built on the Cloudflare ecosystem, integrating with external services like Particle Network, various AI providers, and Polymarket.

```mermaid
graph TD
    A[User] -->|Accesses| B(Frontend: Next.js PWA/Telegram Mini App)
    B -->|Authenticates via| C(Particle Network: Social Login & Wallet)
    B -->|Interacts with| D(Cloudflare Workers: Backend APIs)
    B -->|Fetches data from| E(Cloudflare D1 Database)
    D -->|Calls| F(AI Service Adapter)
    F -->|Integrates with| G(External AI Providers: Mistral, Gemini)
    D -->|Interacts with| H(Polymarket Smart Contracts)
    D -->|Fetches data from| I(Polymarket API)
    H -->|On-chain interaction| J(EVM Testnet)
    D -->|Automated Posting| K(Social Media Platforms: X, Facebook)
    E -->|Stores Content Metadata| K
```

**Component Roles:**

*   **Frontend (Next.js PWA/Telegram Mini App):** The primary user interface, responsible for rendering the "Hyperspace Gateway" UI, handling user interactions, and communicating with backend APIs and external services.
*   **Particle Network:** Provides seamless social login and manages self-custodial wallet creation and EVM interactions for users.
*   **Cloudflare Workers (Backend APIs):** Serverless functions handling business logic, API integrations, and data processing. This includes APIs for "First Play Free," "Smart Bet," pSEO generation, and social posting.
*   **Cloudflare D1 Database:** A serverless SQL database used for storing application-specific data such as user preferences, referral data, and content metadata.
*   **AI Service Adapter:** An abstraction layer within Cloudflare Workers that allows for flexible integration with different external AI providers.
*   **External AI Providers (Mistral, Gemini):** Third-party AI services used for generating text (e.g., SEO content) and images.
*   **Polymarket Smart Contracts:** Deployed on an EVM testnet, these contracts enable on-chain betting interactions with the Polymarket protocol.
*   **Polymarket API:** Provides data feeds for active prediction markets.
*   **Social Media Platforms (X, Facebook):** Targets for automated posting of pSEO content.
*   **EVM Testnet:** The blockchain environment where Polymarket smart contracts are deployed and transactions occur.

### **4. Detailed Component Design**

#### **4.1. Frontend (Next.js/React)**

*   **Technology Stack:** Next.js, React, Zustand (for state management), Shadcn UI components.
*   **Key Components:**
    *   [`src/components/onboarding/OnboardingModal.tsx`](src/components/onboarding/OnboardingModal.tsx): Manages the initial user onboarding flow, including social login and "First Play Free" claim.
    *   [`src/components/game/GameCard.tsx`](src/components/game/GameCard.tsx) (to be replaced by "Insight Shard"): Displays individual game entries with immersive animations.
    *   `SmartBetPanel.tsx` (new): Provides the "Smart Bet" AI suggestion feature on game pages.
    *   `PolymarketMarketList.tsx` (new): Displays active Polymarket prediction markets.
    *   `UserPositionsTab.tsx` (new): Shows user's open and historical Polymarket bets.
*   **UI/UX:** Implementation of "Cosmic Bloom" palette, "Hyperspace Jump" transitions, and "Insight Shard" components to achieve the "Flash" experience.
*   **PWA & Telegram Mini App:** Configuration in `next.config.mjs` and a basic wrapper for Telegram Mini App integration.
*   **State Management:** `useUserStore` (Zustand) will manage global user state, including authentication status, wallet address, and `hasClaimedFirstPlay` flag.

#### **4.2. Backend (Cloudflare Workers)**

*   **Technology Stack:** Cloudflare Workers, Hono (for API routes).
*   **Key API Routes/Workers:**
    *   `POST /api/first-play-free`:
        *   **Input:** User token (from Particle Network).
        *   **Logic:** Verifies token, checks D1 for existing claim, creates user record if new, assigns micro-value credit, updates `hasClaimedFirstPlay` in D1.
        *   **Output:** Success/failure, credit amount.
    *   `POST /api/smart-bet`:
        *   **Input:** `gameId`, `riskProfile`.
        *   **Logic:** Calls `AI Service Adapter` to get a bet suggestion from Mistral AI.
        *   **Output:** Suggested wager amount and multiplier.
    *   `workers/pSeoGenerator` (Cron Triggered):
        *   **Logic:** Fetches headliner event from Polymarket, calls `AI Service Adapter` (Mistral for text, Gemini for image), stores generated content in `content_metadata` D1 table.
    *   `workers/socialPoster` (D1 Triggered):
        *   **Logic:** Triggered by new `content_metadata` entries, posts links to new pSEO pages with AI-generated image and caption to X and Facebook. Saves social media post IDs back to D1.

#### **4.3. Database (Cloudflare D1)**

*   **Technology Stack:** Cloudflare D1 (SQLite compatible).
*   **Key Tables & Schemas:**
    *   `users`: Stores user information, including `particle_id`, `wallet_address`, `has_claimed_first_play`, `referral_code`, `referred_by`.
    *   `leads`: Stores data for pSEO landing page lead capture.
    *   `user_preferences`: Stores user-specific settings.
    *   `content_metadata`: Stores metadata for AI-generated pSEO content, including `slug`, `title`, `seo_text`, `image_url`, `polymarket_event_id`, `x_post_id`, `facebook_post_id`.
    *   `referrals`: Stores referral relationships and performance metrics.

#### **4.4. Particle Network Integration**

*   **Role:** Primary authentication and wallet management solution.
*   **Functionality:**
    *   Social login (Google, etc.).
    *   Automatic creation of self-custodial wallets.
    *   EVM wallet integration for Polymarket betting.
*   **Frontend Integration:** `useParticleConnect` hook and `ParticleProviderWrapper`.
*   **Backend Integration:** Verification of user tokens from Particle Network.

#### **4.5. AI Service Adapter**

*   **Location:** `src/services/aiAdapter.ts` (or similar).
*   **Purpose:** Abstract interaction with various LLM providers.
*   **Methods:**
    *   `getBetSuggestion(gameId, riskProfile)`: Calls Mistral for "Smart Bet" suggestions.
    *   `generateSeoText(eventData)`: Calls Mistral for pSEO text generation.
    *   `generateImage(prompt)`: Calls Gemini for AI image generation.
*   **Configuration:** Environment variables to switch between AI providers.

#### **4.6. External APIs**

*   **Polymarket API:** Used by Cloudflare Workers and potentially frontend for fetching real-time market data.
*   **Mistral AI API:** For text generation (Smart Bets, pSEO content).
*   **Gemini API:** For image generation (pSEO content).
*   **X (Twitter) API:** For automated social posting.
*   **Facebook Graph API:** For automated social posting.

### **5. Interfaces and Data Flows**

#### **5.1. User Onboarding Flow**

```mermaid
sequenceDiagram
    actor U as User
    participant F as Frontend
    participant PN as Particle Network
    participant BW as Backend Worker (API)
    participant D1 as Cloudflare D1

    U->>F: Clicks "Sign in with Social"
    F->>PN: Initiates social login
    PN-->>U: Prompts for social account
    U-->>PN: Authenticates
    PN->>F: Returns user info & wallet address
    F->>BW: POST /api/first-play-free (userToken)
    BW->>D1: Check if user exists & has claimed first play
    alt User is New
        BW->>D1: Create new user record
        BW->>D1: Set has_claimed_first_play = TRUE
        BW-->>F: Success (creditAmount)
        F->>U: Displays "First Play Free" confirmation
    else User exists & claimed
        BW-->>F: Error (already claimed)
        F->>U: Displays error/no credit
    end
    F->>U: Advances onboarding modal
```

#### **5.2. Gamba Game Play & Smart Bet Flow**

```mermaid
sequenceDiagram
    actor U as User
    participant F as Frontend
    participant BW as Backend Worker (API)
    participant AIA as AI Service Adapter
    participant AI as External AI (Mistral)

    U->>F: Navigates to Game Page
    F->>U: Renders Game UI & SmartBetPanel
    U->>F: Clicks "Smart Bet" button
    F->>BW: POST /api/smart-bet (gameId, riskProfile)
    BW->>AIA: Calls getBetSuggestion(gameId, riskProfile)
    AIA->>AI: Requests bet suggestion
    AI-->>AIA: Returns suggested amount & multiplier
    AIA-->>BW: Returns suggestion
    BW-->>F: Returns suggestion
    F->>U: Displays suggested bet in SmartBetPanel
    U->>F: (Optional) Accepts/Adjusts bet & Plays Game
```

#### **5.3. Gamified Referral System Flow**

```mermaid
sequenceDiagram
    actor U1 as Referring User
    actor U2 as Referred User
    participant F as Frontend
    participant BW as Backend Worker (API)
    participant D1 as Cloudflare D1

    U1->>F: Views Profile Page
    F->>D1: Fetches U1's referral link & stats
    F->>U1: Displays referral link
    U1->>U2: Shares referral link
    U2->>F: Clicks referral link (lands on platform)
    F->>PN: U2 completes social login (as per Onboarding Flow)
    PN->>F: Returns U2 user info
    F->>BW: POST /api/first-play-free (includes referral_code from URL)
    BW->>D1: Records U2 as referred by U1
    D1->>D1: Updates U1's referral stats
    BW-->>F: Confirmation
    F->>U2: Onboarding continues
    U1->>F: (Later) Views updated referral stats
```

#### **5.4. Polymarket Integration Flow**

```mermaid
sequenceDiagram
    actor U as User
    participant F as Frontend
    participant BW as Backend Worker (API)
    participant PMAPI as Polymarket API
    participant SC as Polymarket Smart Contracts
    participant EVM as EVM Testnet
    participant PN as Particle Network

    U->>F: Navigates to /polymarket
    F->>BW: Fetches active markets from Polymarket API (cached)
    BW->>PMAPI: Requests market data
    PMAPI-->>BW: Returns market data
    BW-->>F: Returns market data
    F->>U: Displays market list
    U->>F: Selects market, enters wager, clicks "Place Bet"
    F->>PN: Initiates EVM transaction (via Particle wallet)
    PN->>SC: Calls placeBet() on deployed contract
    SC->>EVM: Executes on-chain transaction
    EVM-->>SC: Transaction result
    SC-->>PN: Transaction result
    PN-->>F: Transaction result
    F->>U: Displays transaction status
    U->>F: Navigates to /profile (My Positions)
    F->>BW: Fetches user's open/past bets
    BW->>SC: Queries user's positions on-chain
    SC->>EVM: Reads blockchain data
    EVM-->>SC: Returns position data
    SC-->>BW: Returns position data
    BW-->>F: Returns position data
    F->>U: Displays user's positions
```

#### **5.5. AI Content & Social Posting Flow**

```mermaid
sequenceDiagram
    participant CF_CRON as Cloudflare Cron Job
    participant PSEOG as pSeoGenerator Worker
    participant PMAPI as Polymarket API
    participant AIA as AI Service Adapter
    participant AI as External AI (Mistral/Gemini)
    participant D1 as Cloudflare D1
    participant SOCP as SocialPoster Worker
    participant X as X (Twitter) API
    participant FB as Facebook Graph API

    CF_CRON->>PSEOG: Daily Trigger
    PSEOG->>PMAPI: Fetch "headliner" event
    PMAPI-->>PSEOG: Returns event data
    PSEOG->>AIA: generateSeoText(eventData)
    AIA->>AI: Requests SEO text (Mistral)
    AI-->>AIA: Returns SEO text
    PSEOG->>AIA: generateImage(prompt)
    AIA->>AI: Requests image (Gemini)
    AI-->>AIA: Returns image URL
    PSEOG->>D1: Store content_metadata (slug, title, seo_text, image_url, event_id)
    D1->>SOCP: Trigger (new content_metadata entry)
    SOCP->>X: Post new pSEO page link + image + caption
    X-->>SOCP: Post ID
    SOCP->>FB: Post new pSEO page link + image + caption
    FB-->>SOCP: Post ID
    SOCP->>D1: Update content_metadata with X/FB post IDs
```

### **6. Technical Considerations/Assumptions**

*   **Monorepo Structure:** Development will continue within the `bankkroll-gamba-v2-next.js.git` monorepo, with dedicated `workers/` and `infra/` directories.
*   **Serverless-First:** Emphasis on Cloudflare Pages, Workers, and D1 for scalability, cost-effectiveness, and reduced operational overhead.
*   **Testing:**
    *   **Unit Tests:** Mandatory for all new business logic (AI adapter, referral logic, fee structures).
    *   **E2E Tests:** Cover full user journeys for "First Play Free" onboarding, Gamba game lifecycle, and Polymarket betting lifecycle.
    *   **Visual Regression Tests:** For key UI components to prevent design degradation.
*   **Scalability:** The pSEO engine and D1 database schema are designed to scale to thousands of pages without significant manual oversight or cost increase.
*   **Caching:** Cloudflare KV will be implemented for Polymarket data to ensure UI performance and resilience against external API downtime.
*   **Modularity:** The core architecture is designed to support future integrations (e.g., THORChain) without major refactoring.
*   **Security:** All API routes and smart contract interactions will adhere to best practices for security, including input validation, authentication, and authorization.
*   **Cost Optimization:** Infrastructure will be designed to operate within free or near-zero-cost tiers for the initial 6 months.

### **7. Future Enhancements (Out of Scope for this Document)**

*   THORChain integration for cross-chain swaps.
*   Implementation of a high-contrast light theme.
*   Advanced gamification features for the referral system.
*   Further AI model integrations and optimizations.