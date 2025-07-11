# Regulatory Compliance Epic

## Story: Geofenced Access

As a platform operator, I want to restrict access by region so we comply with local laws.

**Acceptance Criteria:**

- Block access from prohibited jurisdictions using Cloudflare Workers
- Show geo-block message with supported regions list
- Maintain allowed country list in admin dashboard

## Story: KYC Verification

As a compliance officer, I want players to complete on-chain KYC before large withdrawals.

**Acceptance Criteria:**

- Integrate Polygon ID for credential verification
- Trigger KYC check for withdrawals >$1000 equivalent
- Store verification status encrypted in user profile

## Story: Age Gate

As a platform operator, I want to verify user age during signup.

\*\*Acceptance Criteria:

- Mandatory age confirmation checkbox
- Block access if under 18 years old
- Audit log of age verification timestamps
