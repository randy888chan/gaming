# Product Requirements Document: Quantum Nexus v2.0 (The Phoenix Blueprint)

**Document Status:** **ACTIVE & DEFINITIVE** | **Version:** 2.0 | **Date:** 2025-07-08

## 1. Vision & Core Principles

**Vision:** To build the definitive, viral dApp that seamlessly integrates Web3 gaming and prediction markets, made accessible to a mainstream audience of existing crypto holders through a radically simple, "flash and viral" user experience delivered via PWA and Telegram Mini App.

**Core Principles:**

- **User-Centric Simplicity:** Abstract all non-essential blockchain complexity. The user journey must feel as simple as a modern web app.
- **Maximum Abstraction:** Fully leverage our dependencies (ZetaChain, Particle Network) to minimize bespoke code and security surface.
- **Singular Logic:** Core cross-chain logic resides in a **single smart contract on the ZetaChain zEVM** for security and upgradeability.
- **Lean Infrastructure:** The entire platform runs on the **Cloudflare serverless ecosystem** for scalability and cost-efficiency.

## 2. The Four Pillars (Non-Negotiable Dependencies)

1.  **Gamba v2:** The foundational SDK for all on-chain casino-style gaming.
2.  **Polymarket:** The exclusive source and settlement layer for all prediction markets, accessed via the `@polymarket/clob-client`.
3.  **ZetaChain:** The exclusive omnichain layer, enabling our Universal App architecture across **EVM, Solana, and TON**.
4.  **Particle Network:** The exclusive **Wallet-as-a-Service (WaaS)** provider for one-click social login, Smart Wallet creation (including TON), and gas fee sponsorship (Paymaster).

## 3. The Definitive Project Roadmap

This is the mandatory, sequential plan. No epic begins until the previous one is **complete and validated**.
