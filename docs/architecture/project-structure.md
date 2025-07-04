# Project Structure

The Quantum Nexus project is organized as a monorepo to manage the frontend, backend, smart contracts, and infrastructure code in a single repository.

### Directory Layout

```plaintext
quantum-nexus/
├── contracts/
│   └── evm/                      # EVM smart contracts (PolymarketAdapter.sol)
├── functions/                    # DEPRECATED: Legacy Firebase Cloud Functions (To be removed)
├── infra/
│   └── d1/
│       └── schema.sql            # The single source of truth for our D1 database schema.
├── public/                       # Static assets, fonts, and images.
├── src/                          # Main Next.js application source code.
│   ├── components/
│   │   ├── admin/                # Admin-specific components (CreditConfigPanel.tsx)
│   │   ├── game/                 # Core Gamba game UI components.
│   │   ├── layout/               # Header, Footer, etc.
│   │   ├── onboarding/           # OnboardingModal.tsx and related components.
│   │   ├── polymarket/           # Components for the Polymarket UI.
│   │   └── tournament/           # NEW: Components for tournament visualization.
│   ├── games/                    # Implementations for individual Gamba games.
│   ├── hooks/                    # Custom React hooks.
│   ├── lib/                      # Core utility functions and libraries.
│   ├── pages/
│   │   ├── api/                  # Serverless API Routes.
│   │   │   ├── v1/
│   │   │   │   └── admin/
│   │   │   │   └── tournaments/  # NEW: CRUD endpoints for tournament management.
│   │   │   ├── first-play-free.ts
│   │   │   └── smart-bet.ts
│   │   └── ...                   # Other Next.js pages.
│   └── services/                 # Backend service adapters (aiAdapter.ts, etc.)
├── workers/                      # Source code for dedicated Cloudflare Workers.
│   ├── pSeoGenerator/
│   └── socialPoster/
└── tests/
    ├── integration/              # Integration tests (Jest, Supertest).
    └── unit/                     # Unit tests (Jest, RTL).
