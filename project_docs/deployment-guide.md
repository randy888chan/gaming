# Quantum Nexus Deployment Guide

## Introduction
This guide provides step-by-step instructions for deploying the Quantum Nexus gaming platform to Cloudflare's serverless ecosystem.

## Prerequisites
- Cloudflare account with Workers and Pages enabled
- Node.js v18+ and npm installed
- ZetaChain testnet access
- Particle Network developer account

## Environment Setup
1. Clone the repository:
```bash
git clone https://github.com/your-org/quantum-nexus.git
cd quantum-nexus
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Populate required environment variables:
```
# Cloudflare
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token

# Particle Network
PARTICLE_PROJECT_ID=your_project_id
PARTICLE_CLIENT_KEY=your_client_key

# ZetaChain
ZETACHAIN_RPC_URL=https://zetachain-testnet-rpc.com

# Viral Growth Engine
VIRAL_GROWTH_API_ENDPOINT=https://api.viral-growth.com
VIRAL_GROWTH_AUTH_TOKEN=your_viral_growth_auth_token
VIRAL_GROWTH_FEATURE_TOGGLE=true

# Credit Configuration
CREDIT_CONFIG_API_KEY=your_credit_config_key
CREDIT_CONFIG_UPDATE_INTERVAL=300
CREDIT_CONFIG_AUDIT_ENABLED=true
```

### Smart Bet Feature Configuration

The Smart Bet feature requires the following configurations:

**1. Environment Variables:**
- `SMART_BET_API_KEY`: API key for the external Smart Bet prediction service.
- `SMART_BET_SERVICE_URL`: Endpoint URL for the Smart Bet prediction service.

**2. Database Changes:**
- A new table `smart_bets` will be created to store bet predictions and outcomes.
- The `user_profiles` table will be updated to include a `smart_bet_opt_in` boolean flag.

**3. External Service Integrations:**
- Integration with a third-party prediction API (e.g., `SmartBetPredictor`).
- Webhooks must be configured to receive real-time updates from the Smart Bet service.

## Database Setup
1. Create D1 database:
```bash
npx wrangler d1 create quantum-nexus-db
```

2. Apply schema migrations:
```bash
npx wrangler d1 execute quantum-nexus-db --file infra/d1/schema.sql
```

### Database Migration for New Schema Changes

For new schema changes, follow these steps using `wrangler d1 migrations`:

1.  **Update `schema.sql`**: Ensure `schema.sql` contains the latest table definitions and alterations.
2.  **Generate Migration File**:
    ```bash
    npx wrangler d1 migrations create quantum-nexus-db --name add_new_feature_schema
    ```
    (Replace `add_new_feature_schema` with a descriptive name for your migration.)
3.  **Apply Migrations (Local Testing)**:
    ```bash
    npx wrangler d1 migrations apply quantum-nexus-db --local
    ```
4.  **Apply Migrations (Production)**:
    ```bash
    npx wrangler d1 migrations apply quantum-nexus-db
    ```

## Database Schema Updates

**Credit Configuration Tables:**
```sql
CREATE TABLE credit_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_key TEXT UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE credit_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    performed_by TEXT NOT NULL,
    performed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(config_id) REFERENCES credit_config(id)
);
```

## Deployment Process
### Frontend Deployment (Cloudflare Pages)
```bash
npm run build
npx wrangler pages deploy ./build --project-name quantum-nexus
```

### Worker Deployment
```bash
# pSEO Generator
cd workers/pSeoGenerator
npx wrangler deploy

# Social Poster
cd ../socialPoster
npx wrangler deploy
```

### EVM Contract Deployment
```bash
cd contracts/evm
npm run deploy:testnet
```

## Post-Deployment Steps
1. Configure cron triggers for workers:
```bash
npx wrangler cron schedule "0 9 * * *" --name pSeoGenerator
```

2. Set up R2 buckets for AI-generated content:
```bash
npx wrangler r2 bucket create ai-content
```

3. Verify deployment:
- Access frontend at your-pages.dev
- Check worker logs in Cloudflare dashboard
- Test API endpoints

## Scaling Considerations for Flash Experience

The Flash Experience is designed for high concurrency and real-time interactions. Consider the following for optimal scaling:

**1. Concurrent Users:**
- The system is designed to handle up to 10,000 concurrent users. Monitor user load to anticipate scaling needs.

**2. Data Volume:**
- Anticipate high read/write operations due to real-time game state updates and user interactions. Optimize database queries and indexing.

**3. Recommended Scaling Strategies:**
- **Auto-scaling:** Implement auto-scaling groups for compute resources (e.g., Cloudflare Workers, backend services) based on CPU utilization, request rates, or custom metrics.
- **Caching:** Utilize in-memory caches (e.g., Redis) for session data, frequently accessed game assets, and user profiles to reduce database load and improve response times.
- **Load Balancing:** Leverage Cloudflare's built-in load balancing to distribute incoming traffic efficiently across multiple instances of your services.
- **Edge Computing:** Maximize the use of Cloudflare Workers for low-latency edge processing, reducing the load on origin servers and improving global responsiveness.

## Security and Dependency Standards

**Credit System Requirements:**
1. **Vulnerability Scanning:**
   - Weekly OWASP ZAP scans for `/api/admin/credit-config*` endpoints
   - Dependency checks using `npm audit --production` during CI/CD
   
2. **Access Control:**
   - Mandatory JWT validation with admin role verification
   - Rate limiting (10 req/min) for configuration endpoints

3. **Audit Requirements:**
   - All credit configuration changes must be logged to credit_audit_log
   - Monthly penetration testing for credit API surface

## Troubleshooting
- **Database connection issues**: Verify D1 binding names in wrangler.toml
- **Worker failures**: Check logs with `npx wrangler tail`
- **Authentication problems**: Confirm Particle Network credentials