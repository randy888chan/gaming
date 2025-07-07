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
