### **SYSTEM DIRECTIVE: 20250712-A (PHOENIX)**

**PROJECT:** Quantum Nexus
**STATUS:** ACTIVE - PHASE 1 (REMEDIATION)
**AUTHORITY:** Chief Orchestrator

This document, Directive 20250712-A, is the **single source of truth** for Project Quantum Nexus. It is immutable and not subject to creative interpretation. All agents, without exception, are bound by the articles herein. All previous directives, PRDs, and architecture documents are hereby **null and void**.

### **Article I: The Prime Directive**

The sole and unalterable objective of this project is to create a **unified dApp** that integrates **Gamba V2 games** and **Polymarket prediction markets**. This dApp **WILL** be built upon the `Gamba-V2-Next.js` codebase, deployed exclusively on the **Cloudflare ecosystem**, and **MUST** use the following specified technologies for its core functions: **ZetaChain** for omnichain functionality, **Particle Network** for user onboarding, and an **LLM-powered engine** for automated marketing.

### **Article II: The Unbreakable Commandments**

#### **I. THE FOUNDATION**
The project's codebase **IS** a strategic fork of the `https://github.com/BankkRoll/Gamba-V2-Next.js.git` repository.

#### **II. THE ECOSYSTEM**
The entire application stack **MUST** be designed for and deployed on **Cloudflare** (Pages, Workers, D1, R2, Queues).

#### **III. THE CORE INTEGRATIONS**
1.  **Particle Network:** The exclusive service for user onboarding, social login, and Smart Wallet creation across **EVM, Solana, and TON**. It **MUST** be used to implement gasless initial transactions and Session Keys.
2.  **ZetaChain:** The exclusive omnichain layer. All cross-chain transactions **MUST** be routed through ZetaChain's protocol via our `CrossChainSettlement.sol` contract.
3.  **Polymarket:** The exclusive source for all prediction market data and interactions, accessed via the `@polymarket/clob-client`.

#### **IV. THE AI ENGINE**
The system **MUST** include two specific LLM-powered features running as Cloudflare Workers: a **pSEO Generator** and a **Social Poster**.

#### **V. THE GLOBAL REACH**
The UI **MUST** support localization for **10 official languages**.

#### **VI. THE PLATFORM FORM FACTOR**
The application **MUST** be a **Progressive Web App (PWA)** and be fully compatible for deployment as a **Telegram Mini App (TMA)**.
