### **Epic 1: The Frictionless Foundation & Core Revenue**
*Goal: To establish a rock-solid, simplified foundation that provides an instant "Time to Wow" for new users and correctly configures our primary revenue streams.*

*   **Story 1.1: Seamless Social Onboarding & Gasless First Play**
    *   **As a new user,** I want to sign up with one click using my social account (e.g., Google, X).
    *   **So that** I can immediately access the platform without needing to understand or manage a crypto wallet.
    *   **And** I want my first few game plays to be completely free and instant, without any gas fee pop-ups or network error messages.
    *   **Acceptance Criteria:**
        *   Integrates `@particle-network/connectkit` SDK.
        *   A successful social login creates a self-custodial Smart Wallet for the user.
        *   The Particle Network Paymaster is configured to sponsor the gas fees for the first **2** on-chain transactions for any new user wallet.
        *   The legacy `/api/first-play-free` endpoint and all related database logic are **removed**.

*   **Story 1.2: Implement Platform Revenue & Gamba Liquidity Provision**
    *   **As the platform operator,** I want to automatically collect a small fee from every game played to ensure the platform is profitable.
    *   **And as a user,** I want to be able to deposit my tokens into the Gamba liquidity pool to become a "part of the house" and earn yield.
    *   **Acceptance Criteria:**
        *   The `<GambaProvider>` is configured with our platform's official `creator` address and a `creatorFee` of **0.5%**.
        *   A new UI page (`/liquidity`) is created.
        *   This page displays the current total liquidity in the main Gamba pool.
        *   Users can use this interface to deposit supported tokens (e.g., USDC, SOL) into the pool.
        *   Users can use this interface to withdraw their share of the pool (burn their LP tokens).
