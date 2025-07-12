# Story 4.1: Platform Internationalization (i18n)

**Epic:** 4: Internationalization & Advanced Features
**Status:** Approved

## User Story
- **As a non-English speaking user,** I want to use the entire platform in my native language,
- **So that** I can have a comfortable and intuitive user experience.

## Acceptance Criteria
1.  **Framework Configured:** The `next-i18next` library is fully configured.
2.  **Target Languages Implemented:** JSON translation files are created in `public/locales/` for all 10 target languages.
3.  **Static Text Replaced:** All static UI text is sourced from the JSON translation files.
4.  **Language Switcher Added:** A language switcher is implemented in the UI header.
5.  **Locale Persistence:** The user's language preference is persisted across sessions.

## Dev Notes
- A script should be created to automate the initial population of translation files using the `aiAdapter` to ensure all language files are synchronized.
