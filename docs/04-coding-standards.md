### FILE: 04-coding-standards.md

# Coding Standards: Quantum Nexus

All AI agents contributing to the Quantum Nexus codebase must adhere to the following standards. These rules ensure the code is maintainable, readable, and scalable.

## 1. General Principles

-   **Language:** All code must be written in **TypeScript**. The `any` type is strictly forbidden; use `unknown` for cases where the type is genuinely unknown at compile time.
-   **Formatting:** All code will be automatically formatted on commit using **Prettier** with the settings defined in the repository. Agents must not disable or bypass the formatter.
-   **Linting:** All code must pass **ESLint** checks without any errors or warnings. Agents should run the linter before finalizing their work.

## 2. Naming Conventions

-   **Variables & Functions:** Use `camelCase`. Example: `const userProfile;`, `function getUserProfile()`.
-   **Components & Interfaces/Types:** Use `PascalCase`. Example: `function UserProfile()`, `interface UserProfileProps`.
-   **Constants:** Use `SCREAMING_SNAKE_CASE` for global, hard-coded constants. Example: `const PLATFORM_FEE = 0.01;`.
-   **Files:**
    -   React components: `PascalCase.tsx`. Example: `UserProfile.tsx`.
    -   All other TypeScript files: `camelCase.ts`. Example: `apiUtils.ts`.

## 3. Component & Application Structure

-   **Component-Based Architecture:** The UI must be built with modular, reusable React components.
-   **Props Interfaces:** Every React component must have a clearly defined `interface` for its props, ending with the `Props` suffix. Example: `interface UserProfileProps`.
-   **File Organization:** New components should be placed in the `src/components/` directory, organized by feature (e.g., `src/components/polymarket/`). Hooks should be in `src/hooks/` and utility functions in `src/lib/` or `src/utils/`.
-   **Environment Variables:** All sensitive keys (API keys, secrets) and environment-specific settings must be managed through environment variables. Access them via `process.env`. The `.env.example` file must be kept up-to-date with all required variables.

## 4. API & Backend

-   **API Endpoint Naming:** API endpoints should be RESTful, using nouns to represent resources. Use kebab-case. Example: `/api/v1/user-preferences`, `/api/v1/smart-bet`.
-   **Versioning:** All API endpoints must be versioned, starting with `/api/v1/...`.
-   **Error Handling:** API endpoints must return standardized JSON error responses. For example: `{ "success": false, "error": "Descriptive error message" }` with appropriate HTTP status codes (e.g., 400, 404, 500).
-   **Asynchronous Operations:** Use `async/await` syntax for all asynchronous operations. Avoid using `.then()` chains for complex logic.

## 5. Comments & Documentation

-   **Function Documentation:** All non-trivial public functions must include a JSDoc comment block explaining their purpose, parameters, and return value.
    ```typescript
    /**
     * Retrieves the user's profile from the database.
     * @param userId - The unique identifier for the user.
     * @returns The user profile object, or null if not found.
     */
    ```
-   **Complex Logic:** Inline comments should be used to explain complex, non-obvious, or "tricky" parts of the code. Comments should explain *why* the code is written a certain way, not *what* it does.
-   **TODOs:** Use `// TODO:` comments to mark areas that require future work. Include a brief description of what needs to be done.

## 6. Security & Best Practices

-   **No Hardcoded Secrets:** Never commit API keys, private keys, or other secrets directly into the codebase.
-   **Input Validation:** All data coming from external sources (API requests, user input) must be rigorously validated before being processed or stored.
-   **Dependency Management:** All new dependencies must be approved. The AI swarm will be tasked with running `npm audit` periodically to identify and help remediate vulnerabilities.
```

Are you satisfied with these coding standards? We can add, remove, or modify any rule.
