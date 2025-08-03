# Quantum Nexus Deployment Guide

## 1. Prerequisites
- Node.js v18+
- npm v9+
- Cloudflare account with:
  - Pages enabled
  - **D1 database**
  - Workers/Queues access
- ZetaChain testnet access
- Cloudflare Wrangler CLI installed globally:
```bash
npm install -g wrangler
```

## 2. Environment Setup
Create `.env` file with required variables:
```ini
# Particle Network
PARTICLE_PROJECT_ID=your_project_id
PARTICLE_CLIENT_KEY=your_client_key
PARTICLE_APP_ID=your_app_id

# ZetaChain
ZETACHAIN_CONNECTOR_ADDRESS=0x...
```

## 3. Cloudflare D1 Database Setup
1. Create D1 database in Cloudflare dashboard
2. Bind database to your Cloudflare Pages project
3. Initialize schema:
```bash
wrangler d1 execute DB_NAME --file=infra/d1/schema_v2.sql
```

## 4. Deployment Steps

### Local Development
```bash
npm install
npm run dev
```

### Cloudflare Pages Deployment
1. Connect GitHub repository to Cloudflare Pages
2. Set build settings:
   - Build command: `npm run build`
   - Build output directory: `out`
3. Add environment variables in Cloudflare dashboard

### Smart Contract Deployment
```bash
npx hardhat run scripts/deploy-polymarket-adapter.ts --network zeta_testnet
```

## 5. Post-Deployment Verification
1. Check Cloudflare Pages deployment status
2. Verify D1 database connection via Cloudflare dashboard
3. Run smoke tests:
```bash
npm run test:smoke
```

## 6. Cloudflare-Specific Operations
- **Database migrations**:
```bash
wrangler d1 migrations apply DB_NAME
```
- **Production data backup**:
```bash
wrangler d1 backup create DB_NAME
```
- **Query database**:
```bash
wrangler d1 execute DB_NAME --command "SELECT * FROM users"
```

> **Note:** All database operations are managed through Cloudflare's D1 interface. Local databases are not used in production.