### **Epic 4: Internationalization & Advanced Features**
*Goal: To prepare for a global launch and add features for power users and growth.*

*   **Story 4.1: Platform Internationalization (i18n)**
    *   **As a non-English speaking user,** I want to use the entire platform in my native language.
    *   **ACs:**
        1.  The `next-i18next` framework is fully configured.
        2.  JSON translation files are created in `public/locales/` for the 10 target languages: **English, Mandarin, Spanish, Portuguese, Russian, Turkish, Korean, Japanese, Vietnamese, and Indonesian.**
        3.  All static UI text is sourced from the JSON translation files.
        4.  A language switcher component is present and functional in the UI header.

*   **Story 4.2: Build On-Chain Referral System**
    *   **As a user,** I want to earn real, on-chain rewards for referring new users.
    *   **ACs:**
        1.  A unique referral link is generated for each user.
        2.  The backend logic is implemented to attribute new users to their referrer.
        3.  When a referred user plays, a percentage of the platform fee is sent to the referrer's wallet via a transparent ZetaChain transaction, which is logged in the `zetachain_cctx_log` table.
