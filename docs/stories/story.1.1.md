# Story 1.1: Critical Security Remediation

**Epic:** 1: Foundation & Remediation
**Status:** Approved
**Priority:** CRITICAL

## User Story
- **As:** a user of Quantum Nexus,
- **I want:** my data, assets, and interactions with the platform to be completely secure,
- **So that:** I can play and bet with confidence, knowing the system is robust and trustworthy.

## Definition of Ready
- [x] `docs/api_security_report.md` has been analyzed and its findings are the basis for this story.
- [x] All necessary secrets (e.g., `PARTICLE_NETWORK_JWT_SECRET`) are available in the Cloudflare development environment.
- [x] The acceptance criteria are unambiguous and directly testable.

## Acceptance Criteria
1.  **Authentication is Enforced:** The mocked `particleUserId` is completely removed from all API endpoints. All protected API endpoints (especially user data and credit-related routes) validate a real Particle Network JWT from the `Authorization` header. Unauthorized requests result in a `401 Unauthorized` error.
2.  **SQL Injection Vulnerabilities are Eliminated:** All database queries in all API routes (`src/pages/api/**/*.ts`) are converted to use parameterized statements (`.bind(...)`). A code scan (e.g., Semgrep) confirms no raw string interpolation is used to construct SQL queries.
3.  **Input Validation is Implemented:** User-provided inputs, especially wallet addresses in API request bodies (e.g., `src/pages/api/v1/users/index.ts`), are validated for correct format on the server-side using a library like `ethers.isAddress` or an equivalent. Invalid inputs result in a `400 Bad Request` error.
4.  **Rate Limiting is Active:** A rate-limiting middleware is applied to all sensitive, unauthenticated, or computationally expensive API endpoints to prevent abuse and DoS attacks.

## Technical Guidance
This is a security-critical task. All changes must be reviewed by a second developer before merging.

-   **Target Files for Authentication & SQL Injection:**
    -   `src/pages/api/v1/users/index.ts`
    -   `src/pages/api/v1/admin/credit-config.ts`
    -   *Audit all other API routes for similar vulnerabilities.*

-   **Authentication Logic (Example):**
    -   **Current Vulnerable Code (`.../users/index.ts`):**
        ```typescript
        // High Risk: Hardcoded mock user ID bypasses all authentication.
        const particleUserId = "mock-particle-user-id-from-token";
        ```
    -   **Required Secure Implementation:**
        ```typescript
        // Use the withAuth middleware or implement directly
        import jwt from 'jsonwebtoken';
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).json({ error: "Unauthorized" });
        }
        const token = authHeader.split(" ");
        try {
          // This must use the real secret from Cloudflare environment
          const decoded = jwt.verify(token, process.env.PARTICLE_NETWORK_JWT_SECRET);
          const particleUserId = decoded.sub; // Or the appropriate field from the JWT payload
        } catch (e) {
          return res.status(401).json({ error: "Invalid Token" });
        }
        ```

-   **SQL Injection Fix (Example):**
    -   **Current Vulnerable Pattern:**
        ```typescript
        // High Risk: Direct string interpolation in SQL
        const query = `SELECT * FROM users WHERE id = '${particleUserId}'`;
        ```
    -   **Required Secure Implementation:**
        ```typescript
        // Safe: Use D1's parameterized binding
        const stmt = DB.prepare("SELECT * FROM user_preferences WHERE particle_user_id = ?").bind(particleUserId);
        const { results } = await stmt.all();
        ```

-   **Secrets Management:**
    -   The `PARTICLE_NETWORK_JWT_SECRET` **MUST** be loaded from Cloudflare secrets. It **MUST NOT** be hardcoded or present in `.env.example`.

-   **Rate Limiting Implementation:**
    -   A middleware function should be created in `src/utils/rateLimitMiddleware.ts`.
    -   Apply this middleware to endpoints like user creation, login attempts, and credit claims.
