### **SYSTEM DIRECTIVE: 20250708-A (PHOENIX)**
**PROJECT:** Quantum Nexus
**STATUS:** ACTIVE - PHASE 1 (REMEDIATION)
**AUTHORITY:** Chief Orchestrator (Saul)

This document, Directive 20250708-A, is the **single source of truth** for Project Quantum Nexus. It is immutable and not subject to creative interpretation. All agents, without exception, are bound by the articles herein. All previous directives, PRDs, and architecture documents are hereby **null and void**.

### **Article I: The Prime Directive**

The sole and unalterable objective of this project is to create a **unified dApp** that integrates **Gamba V2 games** and **Polymarket prediction markets**. This dApp **WILL** be built upon the `Gamba-V2-Next.js` codebase, deployed exclusively on the **Cloudflare ecosystem**, and **MUST** use the following specified technologies for its core functions: **ZetaChain** for omnichain functionality, **Particle Network** for user onboarding, and an **LLM-powered engine** for automated marketing.

### **Article II: The Unbreakable Commandments**

These six commandments are the non-negotiable pillars of the project. They define *what* we are building.

#### **I. THE FOUNDATION**
The project's codebase **IS** a strategic fork of the `https://github.com/BankkRoll/Gamba-V2-Next.js.git` repository. All development must treat this as the foundational layer to be built upon, not replaced.

#### **II. THE ECOSYSTEM**
The entire application stack **MUST** be designed for and deployed on **Cloudflare**.
*   **Hosting & Frontend:** Cloudflare Pages
*   **Backend & APIs:** Cloudflare Workers
*   **Database:** Cloudflare D1
*   **Asset Storage:** Cloudflare R2
*   **Queueing:** Cloudflare Queues

No other cloud providers (e.g., AWS, Vercel, Firebase) will be used for these core functions.

#### **III. THE CORE INTEGRATIONS**
The project has critical, mandatory external service and blockchain integrations:
1.  **Particle Network:** This **IS** the exclusive service for user onboarding, social login, and Smart Wallet creation. It **MUST** provide self-custodial wallets for **EVM, Solana, and TON**. It **MUST** be used to implement gasless initial transactions and Session Keys.
2.  **ZetaChain:** This **IS** the omnichain layer. All cross-chain transactions and messaging between **EVM, Solana, and TON** **MUST** be routed through ZetaChain's protocol via our `CrossChainSettlement.sol` contract.
3.  **Polymarket:** This **IS** the exclusive source for all prediction market data and interactions, accessed via the `@polymarket/clob-client`.

#### **IV. THE AI ENGINE**
The system **MUST** include two specific LLM-powered features running as Cloudflare Workers, communicating via Cloudflare Queues:
1.  **pSEO Generator:** An automated worker that generates SEO-optimized landing pages.
2.  **Social Poster:** An automated worker that posts links to new content to social media.

#### **V. THE GLOBAL REACH**
The user interface **MUST** be built to support localization for the 10 official languages: **English, Mandarin, Spanish, Portuguese, Russian, Turkish, Korean, Japanese, Vietnamese, and Indonesian.**

#### **VI. THE PLATFORM FORM FACTOR**
The application **MUST** be architected to meet the following deployment targets. These are not optional extras; they are primary goals.
1.  **Progressive Web App (PWA):** The application **MUST** be a fully installable PWA.
2.  **Telegram Mini App (TMA):** The application **MUST** be fully compatible and deployable as a Telegram Mini App.

### **Article III: The Implementation Protocol (Roadmap)**

This is the mandatory, sequential plan for *how* the project will be built, as detailed in `docs/prd/prd.md`. No phase begins until the previous one is complete and validated.

*   **Phase 1:** Compliance & Core Refactoring
*   **Phase 2:** The Unified dApp Experience
*   **Phase 3:** AI Growth Engine & UX Enhancements
*   **Phase 4:** Internationalization & Advanced Features

### **Article IV: Concluding Mandate**

This directive is absolute. All agents will now proceed according to this document and its supporting PRD and Architecture blueprints, beginning with the first story of **Epic 1**.
