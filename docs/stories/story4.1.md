# Story 4.1: Platform Internationalization (i18n)

**Epic:** 4: Internationalization & Advanced Features
**Status:** Approved

## User Story
- **As a non-English speaking user,** I want to use the entire platform in my native language,
- **So that** I can have a comfortable and intuitive user experience.

## Acceptance Criteria
1.  **Framework Configured:** The `next-i18next` library is installed and fully configured.
2.  **Target Languages Implemented:** JSON translation files are created in `public/locales/` for all 10 target languages: **English, Mandarin (zh), Spanish (es), Portuguese (pt), Russian (ru), Turkish (tr), Korean (ko), Japanese (ja), Vietnamese (vi), and Indonesian (id).**
3.  **Static Text Replaced:** All static UI text throughout the application is sourced from the JSON translation files using the `t('key')` function.
4.  **Language Switcher Added:** A language switcher component is implemented and is accessible from the main UI header, allowing users to easily change their preferred language.
5.  **Locale Persistence:** The user's language preference is persisted across sessions (e.g., using `localStorage` or a cookie).

## Tasks / Subtasks
-   [ ] **Task 1 (AC #1):** Install and configure `next-i18next` and `react-i18next`.
-   [ ] **Task 2 (AC #3):** Perform a comprehensive audit of the entire `src/components` and `src/pages` directories and replace all hardcoded text strings with i18n keys.
-   [ ] **Task 3 (AC #2):** Create the necessary directory structure and empty `common.json` files for all 10 target languages.
-   [ ] **Task 4:** Create a script (`scripts/generate-translations.ts`) that uses the `aiAdapter` to populate the `common.json` files with initial translations for all keys.
-   [ ] **Task 5 (AC #4, #5):** Create the `LanguageSwitcher.tsx` component and integrate it into `Header.tsx`.

## Dev Notes
-   This story focuses on **static UI content only**. The translation of dynamic, database-driven content (like pSEO articles) is a separate concern.
-   The translation generation script is a crucial piece of automation to ensure all language files remain synchronized as new UI text is added.
