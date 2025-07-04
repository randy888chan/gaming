# Database Schema

The official schema for the Cloudflare D1 database. This unified schema supports all platform features, including user preferences, pSEO content, and the new tournament system. The canonical SQL definition is intended for the file located at `infra/d1/schema.sql`.

### D1 Migration Command

When you are in a terminal environment with the Cloudflare `wrangler` CLI installed, you will use the following command to create and initialize your database. This command executes the `schema.sql` file against your D1 instance.

**For Local Testing:**
```bash
# This command applies the schema to a local database file for development.
npx wrangler d1 execute quantum-nexus-db --file=infra/d1/schema.sql --local
