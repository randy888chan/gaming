# Story 4.1: Platform Internationalization (i18n)

**Epic:** 4: Internationalization & Advanced Features
**Status:** Approved
**Priority:** MEDIUM

## User Story
- **As:** a non-English speaking user,
- **I want:** to use the entire platform in my native language,
- **So that:** I can have a comfortable, clear, and intuitive user experience.

## Definition of Ready
- [x] The 10 official target languages have been defined in `docs/market-research.md`.
- [x] The `next-i18next` library is included in the project's dependencies.
- [x] All core UI components from previous stories are complete and ready for localization.

## Acceptance Criteria
1.  **Framework is Fully Configured:** The `next-i18next` library is correctly configured in `next-i18next.config.js`. The `appWithTranslation` HOC is applied in `_app.tsx`.
2.  **Target Languages are Implemented:** JSON translation files are created in `public/locales/` for all 10 target languages: **en, zh, es, pt, ru, tr, ko, ja, vi, id**. Each language folder contains at least `common.json` and `header.json`.
3.  **All Static Text is Localized:** All static UI text strings throughout the application (components, pages) are replaced with the `t('key')` function from the `useTranslation` hook. There are no hardcoded English strings visible to the user.
4.  **Language Switcher is Functional:** A language switcher UI component is implemented in the application header (`src/components/layout/Header.tsx`).
5.  **Locale Persistence is Working:** The user's selected language preference is correctly persisted across sessions using either local storage or a cookie, and is automatically applied on their next visit.

## Technical Guidance

-   **Target Files for Modification/Creation:**
    -   `next-i18next.config.js` (for configuration)
    -   `src/pages/_app.tsx` (to wrap the app)
    -   `public/locales/[lang]/*.json` (new files for all 10 languages)
    -   `src/components/layout/Header.tsx` (for the language switcher)
    -   *All other component files containing display text.*

-   **Configuration (`next-i18next.config.js`):**
    -   Ensure the `locales` array includes all 10 target language codes.
    -   Set `defaultLocale` to 'en'.
    -   Point `localePath` to `path.resolve('./public/locales')`.

-   **Implementation Strategy:**
    1.  Start by wrapping the main component in `_app.tsx` with `appWithTranslation`.
    2.  Go through each component and page (`.tsx` files). Import the `useTranslation` hook from `next-i18next`.
    3.  Identify all hardcoded text strings (e.g., "Play", "Welcome", "Profile").
    4.  Move these strings into the `public/locales/en/common.json` file with a descriptive key (e.g., `"welcome_message": "Welcome to Gamba Play!"`).
    5.  Replace the hardcoded string in the component with `t('welcome_message')`.

-   **Translation Generation:**
    -   To speed up the initial translation process, create a script that uses the `aiAdapter.ts` service.
    -   This script should read the English JSON files as the source of truth and generate the initial drafts for the other 9 languages.
    -   **Important:** These AI-generated translations should be reviewed by a human for accuracy and cultural context before launch, but they provide an excellent starting point.

-   **Language Switcher Component:**
    -   This component should get the list of available languages from `router.locales`.
    -   When a user selects a new language, it should call `router.push(router.asPath, router.asPath, { locale: newLocale })`.
    -   The `next-i18next` configuration will handle saving this preference.
