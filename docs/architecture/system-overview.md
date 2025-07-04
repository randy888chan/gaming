# System Overview

Quantum Nexus is architected as a **serverless, omnichain application** deployed on the Cloudflare ecosystem. This model ensures global scalability, performance, and cost-efficiency, creating a lean and powerful dApp.

-   **Frontend:** A Next.js application on **Cloudflare Pages**, handling all UI and user interactions.
-   **Backend APIs:** A combination of **Next.js API Routes** and dedicated **Cloudflare Workers** for synchronous and asynchronous tasks.
-   **User Management & Wallets:** **Particle Network** provides social logins and self-custodial wallets for Solana, EVM, and TON.
-   **Omnichain Orchestration:** **ZetaChain** serves as the central messaging and value-transfer layer, enabling seamless cross-chain interactions.
-   **Database:** All application state is persisted in a single **Cloudflare D1** SQL database, which serves as the definitive source of truth.

### High-Level Architecture Diagram
```mermaid
graph TD
    subgraph User & Onboarding
        A[User via Browser/PWA/Telegram] --> B(Particle Network WaaS);
        B -- Social Login --> C{Self-Custodial Wallets <br>(SOL, EVM, & TON)};
    end

    subgraph Presentation Layer - Cloudflare Pages
        D[Next.js App - Quantum Nexus UI];
        C --> D;
    end

    subgraph Application & API Layer - Cloudflare
        E[API Routes<br>/api/smart-bet<br>/api/v1/tournaments];
        F[Automation Workers<br>pSEO & Social Poster];
        D -- API Calls --> E;
    end

    subgraph Data & AI Layer
        H[Cloudflare D1 SQL DB]
        E --> H;
        F -- Interacts with --> H;
        G[Swappable AI Service Adapter]
        F -- Uses --> G;
    end
    
    subgraph Blockchain Abstraction - ZetaChain
        K[ZetaChain Omnichain Logic];
        D -- Blockchain TXs --> K;
    end
    
    subgraph On-Chain Protocols
        L[Gamba Protocol on Solana];
        M[Polymarket Protocol on EVM];
        K -- Relays TX to --> L;
        K -- Relays TX to --> M;
    end
