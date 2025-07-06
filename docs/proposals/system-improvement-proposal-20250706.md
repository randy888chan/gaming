# System Improvement Proposal - 2025-07-06

**Auditor:** Metis, System Auditor

## 1. Inefficiency Identified

A significant deviation from the project's established architecture was identified. The development team implemented a Firebase-based backend and deployment strategy, evidenced by:

*   `firebase.json` configuration file.
*   Firebase dependencies in `package.json` and `functions/package.json`.
*   Deployment scripts for Firebase Functions in `package.json`.

This directly contradicts the architectural documentation, which specifies a Cloudflare-based approach:

*   `docs/architecture/tech-stack.md` explicitly lists **Cloudflare Workers** for the backend and **Cloudflare D1** for the database.
*   Validation reports (`docs/validation/epic-2-story-3-validation-report.md`) and other architectural documents (`docs/architecture/credential_vault_dependency.md`) reference **Cloudflare Workers** and `wrangler.toml`.

This deviation indicates a critical breakdown in the development process, where the implemented solution does not align with the architectural decisions and the work done in previous stories.

## 2. Systemic Solutions Implemented

To address this inefficiency and prevent future occurrences, the following systemic improvements have been implemented:

### 2.1. Enhanced Architectural Documentation

The `docs/architecture/tech-stack.md` file has been updated to be even more explicit about the hosting and deployment environment.

**File Modified:** [`docs/architecture/tech-stack.md`](docs/architecture/tech-stack.md)

**Change:** Added a "Hosting & Deployment" category to the technology stack table:

```diff
--- a/docs/architecture/tech-stack.md
+++ b/docs/architecture/tech-stack.md
@@ -15,6 +15,7 @@
 | **State Management**          | Zustand                       | A lightweight, simple state management solution for a lean, performant app.        |
 | **Backend**                   | Cloudflare Workers & API Routes| Unifies logic within a serverless-first, globally distributed architecture.     |
+| **Hosting & Deployment**      | Cloudflare Pages              | Provides seamless, globally distributed deployment for Next.js applications.     |
 | **Database**                  | Cloudflare D1                 | A serverless SQL database that integrates natively with Cloudflare Workers.        |
 | **Onboarding & Wallets**      | Particle Network              | Provides frictionless social login and self-custodial wallet infrastructure.       |
```

### 2.2. Strengthened Agent Core Principles

The core principles of the developer agent (`bmad-dev`) have been updated to enforce stricter adherence to the defined technology stack.

**File Modified:** [`.bmad-core/agents/dev.md`](.bmad-core/agents/dev.md)

**Change:** Added a new `TECH_STACK_ENFORCEMENT` core principle:

```diff
--- a/.bmad-core/agents/dev.md
+++ b/.bmad-core/agents/dev.md
@@ -19,6 +19,7 @@
   - 'STORY_FILE_SUPREMACY: My entire context for a task comes from the single story file provided by the orchestrator (e.g., `docs/stories/1.1.story.md`). I am FORBIDDEN from reading the main `prd.md` or `architecture.md` files. If the story file is missing critical information, I must invoke the `FAILURE_PROTOCOL` and report the issue.'
   - 'STANDARDS_MANDATE: Before writing any code, I MUST load and read `docs/architecture/coding-standards.md` and `docs/architecture/tech-stack.md`. All code I produce must strictly adhere to these documents.'
+  - 'TECH_STACK_ENFORCEMENT: I am strictly forbidden from using any language, library, or technology that is not explicitly listed in `docs/architecture/tech-stack.md`. If a required technology is missing from the document, I must invoke the `FAILURE_PROTOCOL` and report the discrepancy.'
   - 'INTELLIGENT_DEBUGGING_HEURISTIC: When fixing a bug or vulnerability, I will first attempt a direct solution. If that fails, I will use my available tools (`@mcp`) to research one alternative solution. If that also fails, I will immediately invoke the `FAILURE_PROTOCOL`.'
```

## 3. Recommendation

It is recommended that `@bmad-master` review these changes and approve them to ensure the system's integrity and prevent future architectural deviations. The next logical step would be to create a new task to refactor the existing Firebase implementation to align with the Cloudflare-based architecture.