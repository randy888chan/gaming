# Security Standards

These standards are mandatory for all development.

### 1. Secrets Management
-   **No Hardcoded Secrets:** Private keys, API keys, and JWT secrets MUST NOT be hardcoded in the source code.
-   **Environment Variables:** All secrets must be loaded from environment variables (`process.env`).
-   **Secure Fallback:** Applications must be designed to fail if a required secret is not present in the environment. Do not use insecure default or mock values in production code.

### 2. API Security
-   **Authentication:** All administrative or user-specific API endpoints MUST be protected. `credit-config.ts` serves as the template for JWT validation with role-based access control.
-   **Input Validation:** All incoming data from API requests must be rigorously validated and sanitized to prevent injection attacks.
-   **Rate Limiting:** All sensitive or resource-intensive endpoints (e.g., admin panels, new account creation) must be rate-limited.

### 3. Dependency Security Management

**Policy:** The project must be kept free of known critical and high-severity vulnerabilities. Dependencies will be reviewed and updated regularly to maintain a strong security posture.

**Procedure:**
Dependency audits and updates must be performed before any production deployment and on a regular monthly schedule. The process is as follows:

1.  **Automated Fixes:** Run `npm audit fix` to apply all non-breaking security updates automatically. This command resolves most moderate-severity vulnerabilities without manual intervention.
    ```bash
    npm audit fix
    ```

2.  **Manual Updates for Critical Vulnerabilities:** For vulnerabilities that require major version upgrades (often marked as 'critical'), update each package manually to the latest stable version.
    ```bash
    # Example for updating core packages
    npm install next@latest
    npm install jsonwebtoken@latest
    ```

3.  **Regression Testing:** After any dependencies are updated, the full test suite MUST be executed to verify that no breaking changes have been introduced.
    ```bash
    npm run test
    ```
    Only after all tests pass can the changes be merged.

**CI/CD Integration:** The CI pipeline must include a step that runs `npm audit` on every pull request. The build should fail if any new high or critical severity vulnerabilities are detected.
