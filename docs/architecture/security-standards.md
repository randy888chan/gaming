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
