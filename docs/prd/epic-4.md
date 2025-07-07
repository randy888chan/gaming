### **Epic 4: Advanced Functionality & Internationalization**
*Goal: To cater to power users, expand revenue models, and prepare for a global audience.*

*   **Story 4.1: Polymarket Market Making Interface**
    *   **As an advanced user,** I want an interface to place `BUY` and `SELL` limit orders on Polymarket markets.
    *   **So that** I can act as a market maker and earn revenue from the bid-ask spread.
    *   **Acceptance Criteria:**
        *   A new "Pro Trading" page is created.
        *   This UI displays the order book for a selected market.
        *   Users can submit, view, and cancel their open limit orders.

*   **Story 4.2: Platform Internationalization (i18n)**
    *   **As a non-English speaking user,** I want to be able to use the entire platform in my native language.
    *   **So that** I can have a comfortable and intuitive user experience.
    *   **Acceptance Criteria:**
        *   The platform is fully translated into the 10 target languages: `en, es, fr, de, it, pt, ru, zh, ja, ko`.
        *   The `next-i18next` framework is correctly configured.
        *   All static UI text is sourced from the JSON translation files in `public/locales/`.
        *   A language switcher is present in the UI.
