### **Epic 2: The Unified dApp Experience**

_Goal: To build the core user-facing features on the newly stabilized foundation._

- **Story 2.1: Implement Seamless Onboarding & First Play**

  - **As a new user,** I want to sign up with one click using my social account and have my first few plays be gas-free.
  - **ACs:**
    1.  Integrates Particle Network's ConnectKit for social logins.
    2.  A successful social login creates a self-custodial Smart Wallet for the user.
    3.  Particle Network's Paymaster is configured to sponsor the gas fees for the first **2** on-chain transactions initiated from a new user's wallet.
    4.  The legacy API endpoint at `src/pages/api/first-play-free.ts` is deleted.
    5.  All database columns related to the old free play system (`hasClaimedFirstPlay`, `referralCredits`) are removed.

- **Story 2.2: Build Polymarket & Tournament UI**
  - **As a user,** I want to browse Polymarket markets and view tournament brackets.
  - **ACs:**
    1.  A `/polymarket` page is created that displays active markets fetched from the refactored `polymarketService`.
    2.  A `/tournaments/[id]` page is created that renders the `TournamentBracket.tsx` component with real-time data fetched from the D1 database via the API.
    3.  The UI is responsive and performs correctly on both desktop (PWA) and mobile (TMA) form factors.
