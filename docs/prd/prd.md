### **Document 1: The Product Requirements Document (PRD)**

**Activating Persona: John, Strategic Product Owner**

My purpose is to define the "What" and the "Why." This PRD will serve as the guiding light for the entire project, ensuring every feature aligns with our strategic vision.

**Action:** Create a new file at `docs/prd.md` and paste the following content.

**File Path:** `docs/prd.md`
```markdown
# Product Requirements Document: Quantum Nexus v1.3

## 1. Vision & Core Principles

**Vision:** To build a unified, viral decentralized application (dApp) that seamlessly integrates Web3 gaming and prediction markets, made accessible to everyone through a frictionless, Web2-like user experience.

**Core Principles:**
*   **User-Centric Simplicity:** Hide blockchain complexity wherever possible. The user should not need to understand gas fees, bridging, or network switching to enjoy the core product.
*   **Maximum Abstraction:** Leverage the full power of our chosen dependencies (ZetaChain, Particle Network) to minimize our own code's complexity. We build *on top* of them, not *around* them.
*   **Singular Logic:** Our core cross-chain business logic will reside in a single smart contract on the ZetaChain zEVM to ensure consistency and security.
*   **Lean Infrastructure:** The entire platform will run on the Cloudflare serverless ecosystem for scalability and cost-efficiency.

## 2. The Four Pillars (Non-Negotiable Dependencies)

1.  **Gamba v2:** The foundational SDK and protocol for all on-chain gaming.
2.  **Polymarket:** The exclusive source and settlement layer for all prediction markets.
3.  **ZetaChain:** The exclusive omnichain layer for all cross-chain functionality (EVM, Solana, TON).
4.  **Particle Network:** The exclusive "Wallet-as-a-Service" (WaaS) provider for user onboarding, social login, and gas fee sponsorship (Paymaster).

## 3. The Project Roadmap: User Epics & Stories
