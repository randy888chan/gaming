# Story: Develop a user profile management system

**Epic:** Epic 2

## User Story
As a user, I want to manage my profile information so that I can keep my personal details up-to-date and control my privacy settings.

## Definition of Ready
- [x] External dependencies: Auth0 API, Credential Vault access configured
- [x] Acceptance criteria meet INVEST criteria
- [x] QA plan documented in `docs/validation/epic-2-story-4-validation.md`
- [x] Security review completed (REF: docs/architecture/credential_vault_dependency.md)

## Acceptance Criteria
1. Profile Viewing:
   - Displayed fields: username, email, avatar URL, account creation date, last login
   - Read-only fields: user ID, authentication provider

2. Profile Editing:
   - Editable fields: username (3-30 chars), email (valid format), avatar (URL or upload)
   - Validation: Realtime feedback for invalid formats, duplicate checks via API

3. Privacy Settings:
   - Control visibility of: email, gameplay statistics, social connections
   - Granular opt-in/out for data collection categories

4. Security:
   - All changes require re-authentication via MFA
   - Audit trail stored in CloudWatch Logs
   - Encryption of PII fields at rest (AES-256) and in transit (TLS 1.3)

## Technical Guidance
*   **Frontend:**
    - React components using Design System v2.3
    - Form validation with Zod schemas
    - Required fields: username, email
    - Privacy settings toggle group component

*   **Backend API:**
    - GET/PUT /api/v2/profile
    - PATCH /api/v2/profile/privacy
    - Integrates with Auth0 for MFA challenges
    - Rate limiting: 5 requests/minute via API Gateway

*   **Database:**
    - New 'user_profiles' table in RDS PostgreSQL
    - Columns: user_id (UUID), username (citext), email (encrypted), avatar_url, privacy_settings (JSONB)
    - Indexes on username (unique) and email (unique)

*   **Security:**
    - Credential rotation via Vault dynamic secrets
    - Sensitive data masking in logs
    - Audit trail requirements from INFRA-207