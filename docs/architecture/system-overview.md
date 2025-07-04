# System Overview

Quantum Nexus is architected as a **serverless, omnichain application** deployed on the Cloudflare ecosystem. This model ensures global scalability, performance, and cost-efficiency.

- **Frontend:** A Next.js application on **Cloudflare Pages**, handling all UI and user interactions.
- **Backend APIs:** A combination of **Next.js API Routes** and dedicated **Cloudflare Workers** for synchronous and asynchronous tasks.
- **User Management & Wallets:** **Particle Network** provides social logins and self-custodial wallets for Solana, EVM, and TON.
- **Omnichain Orchestration:** **ZetaChain** serves as the central messaging and value-transfer layer, enabling seamless cross-chain interactions.
- **Database:** All application state is persisted in a single **Cloudflare D1** SQL database, which serves as the definitive source of truth.
