
---

#### `FILENAME: docs/architecture/database-schema.md`
```markdown
# Database Schema

The official schema for the Cloudflare D1 database. This unified schema supports all platform features, including user preferences, pSEO content, and the new tournament system. The canonical definition is located at `infra/d1/schema.sql`.

### D1 Migration Command

To apply this schema to a Cloudflare D1 database named `quantum-nexus-db`, use the following `wrangler` command. This should be run after setting up the D1 database in your Cloudflare account.

```bash
npx wrangler d1 execute quantum-nexus-db --file=infra/d1/schema.sql
