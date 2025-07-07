# Quality Assurance Protocol

## Testing Requirements
- 95% branch coverage for cross-chain logic
- Load test ZetaChain integrations at 500 TPS
- Fuzz testing for EVM contracts using Echidna
- Penetration testing for all API endpoints

## Audit Trails
1. All production deploys require Chainlink Proof of Reserve
2. Cross-chain transactions must log to IPFS
3. Smart contract deploys include Bytecode Hash Registry entries

## Release Gates
- Zero critical SonarCloud vulnerabilities
- All P1/P2 bugs resolved
- Performance baseline metrics met


### API Endpoint Removal Validation Checklist
- **Validation Steps:**
    1. Identify all API endpoints marked for removal.
    2. Verify that the endpoints are no longer accessible (404 or 410 status codes).
    3. Ensure no client-side or internal services are still calling the removed endpoints.
    4. Check logs for any errors related to calls to removed endpoints.
    5. Update API documentation to reflect endpoint removal.
- **Concrete Test Cases:**
    - **Removed API Endpoint Verification:**
        - TC-API-001: Attempt to access `/api/first-play-free` endpoint, verifies 404 or 410 status code.

### Database Schema Change Validation Methodology
- **Validation Steps:**
    1. Review schema migration scripts for correctness and idempotency.
    2. Test schema changes on a staging environment with realistic data.
    3. Verify data integrity and consistency after migration.
    4. Perform backward compatibility tests for existing application versions.
    5. Implement and test rollback procedures for schema changes.
- **Concrete Test Cases:**
    - **Database Migration Rollback Tests:**
        - TC-DB-001: Execute a schema migration, then successfully roll back to the previous schema version.
        - TC-DB-002: Verify data integrity after a successful rollback operation.