### FILE: 03-tech-stack.md

# Technology Stack: Quantum Nexus

This document outlines the definitive technology choices for the Quantum Nexus project. All development must conform to this stack to ensure consistency, performance, and maintainability.

| Category                      | Technology / Library                                       | Rationale                                                                                                 |
| :---------------------------- | :--------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| **Programming Language**      | TypeScript                                                 | Provides type safety, which is critical for a complex, multi-chain application and for clear AI agent instructions. |
| **Frontend Framework**        | Next.js (React)                                            | Enables a high-performance frontend with SSG/ISR for SEO, and serverless functions for the backend.      |
| **Styling**                   | Tailwind CSS                                               | A utility-first CSS framework for rapid and consistent UI development.                                    |
| **UI Components**             | shadcn-ui                                                  | A modern, accessible, and customizable component library built on top of Tailwind CSS.                    |
| **3D / Animation**            | React Three Fiber, drei, three.js                          | Essential for delivering the immersive "flash" experience with performant 3D graphics and animations.    |
| **State Management**          | Zustand                                                    | A lightweight, simple, and un-opinionated state management solution perfect for a lean, performant app.   |
| **Backend**                   | Cloudflare Workers & Next.js API Routes                    | Unifies frontend/backend logic within a serverless-first, globally distributed architecture.              |
| **Database**                  | Cloudflare D1                                              | A serverless SQL database that integrates natively with Cloudflare Workers for fast, global data access. |
| **Onboarding & Wallets**      | Particle Network (`@particle-network/connect-react-ui`)    | Provides frictionless social login and self-custodial wallet infrastructure for all integrated chains.    |
| **Blockchain Interaction**    | gamba-react-v2, @solana/wallet-adapter-react, ethers       | Core libraries for interacting with the Solana and EVM blockchains.                                       |
| **Omnichain Layer**           | ZetaChain (`@zetachain/toolkit`)                           | The core protocol for abstracting away blockchain complexity and enabling seamless cross-chain transactions.  |
| **Smart Contract Development**| Hardhat, ethers, OpenZeppelin                              | A robust stack for developing, testing, and deploying EVM-compatible smart contracts.                     |
| **Testing**                   | Jest, React Testing Library, Playwright                    | A comprehensive suite for unit, integration, and end-to-end testing to ensure quality.                   |

```

With the technology stack confirmed, we will now move to the final document: **`04-coding-standards.md`**.

This is where we define clear rules for the AI developers to follow. This ensures the codebase is clean, consistent, and easy to maintain.

Please provide any specific rules you want the AI agents to adhere to. For example:
*   'All function names must be in camelCase.'
*   'API endpoints must be versioned (e.g., /api/v1/...)'
*   'All new components must use TypeScript and have clearly defined props interfaces.'
*   'All functions must include a comment block explaining their purpose, parameters, and return value.'
