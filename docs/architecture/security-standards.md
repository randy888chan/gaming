
---

#### `FILENAME: docs/architecture/security-standards.md`
```markdown
# Security Standards

These standards are mandatory for all development.

### 1. Secrets Management
-   **No Hardcoded Secrets:** Private keys, API keys, and JWT secrets MUST NOT be committed to the codebase.
-   **Environment Variables:** All secrets must be loaded from environment variables (`process.env`) and referenced in a `.env.example` file.
-   **Secure Fallback:** Applications MUST fail if a required secret is not present in the environment. Do not use insecure default values.

### 2. API Security
-   **Authentication:** All administrative or user-specific API endpoints MUST be protected via JWT validation.
-   **Authorization:** Administrative endpoints (`/api/v1/admin/*`) MUST check for a specific admin role or claim within the validated JWT.
-   **Input Validation:** All incoming data from API requests must be rigorously validated and sanitized.
-   **Rate Limiting:** All sensitive or resource-intensive endpoints must be rate-limited.

### 3. Dependency Security Management
**Policy:** The project must be kept free of known critical and high-severity vulnerabilities.

**Procedure:**
Dependency audits must be performed regularly. The following commands should be executed in your local terminal environment.
1.  **Automated Fixes:** Run `npm audit fix` to apply all non-breaking security updates automatically. This command resolves most moderate-severity vulnerabilities without manual intervention.
    ```bash
    npm audit fix
    ```
2.  **Manual Updates:** For vulnerabilities requiring major version upgrades, update each package manually to the latest stable version.
    ```bash
    # Example for updating core packages
    npm install next@latest
    npm install jsonwebtoken@latest
    ```
3.  **Regression Testing:** After any updates, the full test suite MUST be executed to verify application integrity.
    ```bash
    npm run test
    ```
**CI/CD Integration:** The CI pipeline must include a step that runs `npm audit --audit-level=high`. The build should fail if any new high or critical severity vulnerabilities are detected.
