# Security Standards

These standards are mandatory for all development.

### 1. Secrets Management
-   **No Hardcoded Secrets:** Private keys, API keys, and JWT secrets MUST NOT be committed to the codebase.
-   **Environment Variables:** All secrets must be loaded from environment variables (`process.env`) and referenced in a `.env.example` file.
-   **Secure Fallback:** Applications MUST fail if a required secret is not present in the environment. Do not use insecure default values.

### 2. API Security
-   **Authentication:** All administrative and user-specific API endpoints MUST be protected via JWT validation.
-   **Authorization:** Administrative endpoints (`/api/v1/admin/*`) MUST check for a specific admin role or claim within the validated JWT.
-   **Input Validation:** All incoming data from API requests must be rigorously validated and sanitized.
-   **Rate Limiting:** All sensitive or resource-intensive endpoints must be rate-limited, as demonstrated in the `credit-config.ts` example.

### 3. Dependency Security Management
**Policy:** The project must be kept free of known critical and high-severity vulnerabilities.

**Procedure:**
Dependency audits must be performed regularly as part of the development lifecycle.
1.  **Automated Fixes:** Run `npm audit fix` to apply all non-breaking security updates automatically.
    ```bash
    npm audit fix
    ```
2.  **Manual Updates:** For critical vulnerabilities, manually update packages to their latest stable versions.
    ```bash
    npm install <package-name>@latest
    ```
3.  **Regression Testing:** After any updates, the full test suite MUST be executed to verify application integrity.
    ```bash
    npm run test
    ```
