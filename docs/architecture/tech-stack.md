
---

#### `FILENAME: docs/architecture/tech-stack.md`
```markdown
# Technology Stack

This document outlines the definitive technology choices for Quantum Nexus. All development must conform to this stack.

| Category                      | Technology / Library          | Rationale                                                                        |
| :---------------------------- | :---------------------------- | :------------------------------------------------------------------------------- |
| **Language**                  | TypeScript                    | Enforces type safety, critical for a complex dApp and clear AI agent instructions. |
| **Frontend Framework**        | Next.js                       | Enables high-performance UI with SSG/ISR for SEO & serverless backend functions. |
| **Styling**                   | Tailwind CSS & shadcn-ui      | Provides a modern, utility-first approach for rapid and consistent UI development. |
| **3D / Animation**            | React Three Fiber, drei       | Delivers the immersive "flash" experience with performant 3D graphics.            |
| **State Management**          | Zustand                       | A lightweight, simple state management solution for a lean, performant app.        |
| **Backend**                   | Cloudflare Workers & API Routes| Unifies logic within a serverless-first, globally distributed architecture.     |
| **Database**                  | Cloudflare D1                 | A serverless SQL database that integrates natively with Cloudflare Workers.        |
| **Onboarding & Wallets**      | Particle Network              | Provides frictionless social login and self-custodial wallet infrastructure.       |
| **Omnichain Layer**           | ZetaChain                     | The core protocol for abstracting complexity and enabling cross-chain transactions.|
| **Smart Contract Dev**        | Hardhat, ethers, OpenZeppelin | A robust stack for developing, testing, and deploying EVM smart contracts.          |
| **Testing**                   | Jest, Supertest, Playwright   | A comprehensive suite for unit, integration, and end-to-end testing.             |
