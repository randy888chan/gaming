# Quantum Nexus Product Requirements Document (PRD) - Flash & Viral Edition

## Goals and Background Context

### Goals

* **Rapid User Acquisition:** Achieve 10,000 Monthly Active Users (MAUs) within 6 months, driven by aggressive viral marketing and pSEO strategies.
* **Viral Coefficient:** Attain a K-factor of 0.4 or higher, demonstrating powerful user-driven growth.
* **Self-Funding Operation:** Reach a state where automated protocol revenue covers all non-labor operational costs within 12 months, validating our lean startup model.
* **Global Reach:** Launch with 10-language UI support to capture a global audience from day one.
* **Deliver "Wow" Factor:** Establish a new standard for dApp user experience through an immersive, visually stunning, and highly performant interface.

### Background Context

The decentralized application landscape is functionally powerful but often fails on user experience and accessibility. "Quantum Nexus" addresses this by building an omnichain entertainment hub on the robust foundation of the `bankkroll-gamba-v2-next.js` project. We are pivoting to an omnichain-first strategy, using ZetaChain and Particle Network to abstract away blockchain complexity. Our competitive edge will be defined by three pillars: a radically simple and engaging user experience (the "flash"), a self-propelling viral growth engine, and a foundational AI "Smart Bet" feature to provide immediate, tangible value.

### Change Log

| Date       | Version | Description                       | Author |
|:---------- |:------- |:--------------------------------- |:------ |
| 2025-06-15 | 1.0     | Final "Flash & Viral" Edition PRD | John   |

## Requirements

### Functional

* **FR1:** The system shall support user onboarding via social logins (e.g., Google) powered by Particle Network, which will create a self-custodial wallet in the background.
* **FR2:** The system shall offer a one-time, micro-value "First Play Free" credit to new users who sign up via social login.
* **FR3:** The system shall feature a gamified referral system with user tiers and a public leaderboard.
* **FR4:** The system shall provide a "Share a Bet" feature, allowing users to share a direct link to a game with their winning parameters pre-filled.
* **FR5:** The system shall programmatically generate SEO-optimized landing pages targeting timely, "headliner" events from Polymarket (read-only data).
* **FR6:** The system shall automatically post links to new pSEO pages on X and Facebook, accompanied by a unique AI-generated image (from Gemini or similar).
* **FR7:** The system's UI shall be a complete reskin of the existing codebase to match the "Hyperspace Gateway" visual theme, including custom animations for page transitions, buttons, and cards.
* **FR8:** The core Gamba game functionality for at least 2-3 games (e.g., Dice, Crash) shall be fully integrated into the new UI.
* **FR9:** A simple, one-click "Smart Bet" AI suggestion feature (powered by Mistral AI) shall be available on integrated Gamba game pages.
* **FR10:** The application will be configurable as a Progressive Web App (PWA) and deployable as a Telegram Mini App.
* **FR11:** The application UI shall support 10 languages from launch. (Note: AI-generated pSEO content will be English-only for MVP).
* **FR12:** The backend shall feature a swappable "AI Service Adapter" to allow for using different LLMs for different tasks (e.g., Mistral for text, Gemini for images).

### Non Functional

* **NFR1:** All infrastructure must operate within the free tiers of Cloudflare and our chosen AI API providers for the first 6 months.
* **NFR2:** The "Time to Wow" (from landing page to first interaction) must be under 3 minutes.
* **NFR3:** All UI animations must run at a consistent 60 FPS on modern devices.
* **NFR4:** The pSEO engine must be architected to scale to thousands of pages without a significant increase in manual oversight or cost.
* **NFR5:** The architecture must be modular, allowing for deep Polymarket integration and advanced cross-chain swap features (via THORChain) post-MVP.

## User Interface Design Goals

### Overall UX Vision

To create a visually stunning and immersive "Hyperspace Gateway" that feels less like a dApp and more like a high-tech control center for decentralized entertainment. The UX is a core product feature designed to drive retention and virality.

### Key Interaction Paradigms

* **Fluidity & Impact:** Every user click and transition is met with a meaningful, polished animation.
* **Intelligent Simplicity:** AI-driven features are presented as simple, one-click actions.

### Core Screens and Views

* **Homepage:** The central "Nexus Orb" with holographic navigation, animated "Insight Shard" game cards.
* **Game Play Pages:** Immersive, game-specific themes (e.g., "Probability Tunnel" for Crash), with a sleek "Control Console" for wager inputs.
* **pSEO Landing Pages:** Conversion-focused, featuring the animated "Interception Portal" lead capture form.

### Branding

* **Palette:** "Cosmic Bloom" (Deep Space Violet-Black, Quantum Violet, Electric Cyan, Neon Charge Yellow).
* **Metaphors:** "Quantum Nexus," "Hyperspace Jump," "Digital Esoterica."

### Target Device and Platforms

Web Responsive, PWA, and Telegram Mini App.

## Technical Assumptions

### Repository Structure: Monorepo

The `bankkroll-gamba-v2-next.js.git` project structure will be extended. A new `workers/` directory will house Cloudflare Worker code for automations.

### Service Architecture

A serverless-first architecture built entirely on the Cloudflare ecosystem:

* **Hosting & Functions:** Cloudflare Pages
* **Automation:** Cloudflare Workers
* **Database:** Cloudflare D1

### Testing requirements

* Unit tests for all new business logic (AI adapter, referral tiers).
* E2E tests for the core viral loop (social login -> free play -> referral share).
* Visual regression tests to prevent degradation of our "flash" experience.

### Swappable AI Engine

The architecture will feature a central "AI Service Adapter" to abstract LLM provider logic, enabling flexible and cost-effective use of Mistral AI, Gemini, and others.

## Epics

### Epic 1: The "Flash" Experience & Onboarding Engine

**Expanded Goal:** Reskin the existing application with the "Hyperspace Gateway" UI/UX, implement radically simple social onboarding, and configure the project for PWA and Telegram deployment on our Cloudflare infrastructure.

### Story 1.1: Environment Setup & Cloudflare Deployment

As a developer, I want to deploy the existing `bankkroll-gamba-v2-next.js` project to Cloudflare Pages and connect a Cloudflare D1 database, so our foundational infrastructure is live.

#### Acceptance Criteria

- 1: The stock project is successfully deployed to a Cloudflare Pages environment.
- 2: A D1 database is created, and the schema for `leads`, `user_preferences`, and `content_metadata` is applied.
- 3: A health check API route (`/api/health`) confirms successful database connection.

### Story 1.2: Immersive UI Reskin

As a user, I want to experience the "Cosmic Bloom" color palette and unique "Hyperspace Gateway" animations, so the platform feels premium and exciting from my first visit.

#### Acceptance Criteria

- 1: The application's color scheme and typography are updated to match the "Cosmic Bloom" style guide.
- 2: Page transitions are replaced with the "Hyperspace Jump" animation.
- 3: The existing `GameCard.tsx` is replaced with the multi-layered, animated "Insight Shard" component.
- 4: The application is configured as a PWA and a basic wrapper for the Telegram Mini App is created.

### Story 1.3: Social Login & "First Play Free"

As a new user, I want to sign up with my social account via Particle Network and receive a "First Play Free" credit, so I can start playing immediately with zero friction.

#### Acceptance Criteria

- 1: Particle Network is integrated as the primary authentication method.
- 2: A "Sign in with Google" (or similar) button is the main call-to-action.
- 3: Upon successful social login, a new user profile is created in D1.
- 4: A one-time, micro-value credit is programmatically assigned to the new user's session for their first play.

### Epic 2: The Viral Growth & AI Engine

**Expanded Goal:** Build and launch the automated marketing engine and the core "Smart Bet" AI feature to drive user acquisition and deliver immediate value.

### Story 2.1: Gamified Referrals & "Share a Bet"

As a user, I want to be rewarded for bringing friends to the platform and easily share my exciting wins, so I feel invested in the community's growth.

#### Acceptance Criteria

- 1: The existing referral logic is connected to a new UI component displaying referral tiers and a simple leaderboard.
- 2: After a winning play, a "Share this Bet" button appears, which generates a unique link to the game with the winning parameters.

### Story 2.2: AI Content & Image Generation Engine

As a developer, I want to build a Cloudflare Worker that can generate pSEO landing pages with unique text and images, so we can automate content marketing.

#### Acceptance Criteria

- 1: A Cloudflare Worker is created, triggered by a cron job.
- 2: The worker calls the Mistral AI API to generate text for a new "headliner" event landing page.
- 3: The worker calls the Gemini (or other) AI API to generate a relevant image for the event.
- 4: The generated content and metadata (including image URL) are stored in the Cloudflare D1 `content_metadata` table.
- 5: A dynamic Next.js page (`/games/seo/[slug]`) renders the content from D1.

### Story 2.3: Automated Social Posting

As a marketer, I want new pSEO pages to be automatically posted to X and Facebook with their unique AI-generated images, so we can capture event-driven traffic instantly.

#### Acceptance Criteria

- 1: A Cloudflare Worker is implemented that is triggered when a new page is saved to D1.
- 2: The worker posts a link to the new page along with its AI-generated image and caption to both X and a Facebook Page.
- 3: The social media post IDs are saved back to the `content_metadata` table in D1.

### Story 2.4: "Smart Bet" AI Feature MVP

As a user, I want a "Smart Bet" button on the Dice and Crash game pages that gives me a simple, AI-powered bet suggestion, so I can play with more confidence.

#### Acceptance Criteria

- 1: A `SmartBetPanel.tsx` component is added to the Dice and Crash game pages.
- 2: The component features a single button that calls an API route (`/api/smart-bet`).
- 3: The API route uses the "Swappable AI Engine" to call Mistral AI and get a simple bet suggestion.
- 4: The suggestion is clearly displayed to the user.
