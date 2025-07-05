import { D1Database as CF_D1Database } from '@cloudflare/workers-types';

declare global {
  interface CustomEnv {
    DB: CF_D1Database;
  }
  namespace NodeJS {
    interface ProcessEnv extends CustomEnv {
      // Add other environment variables here if needed
      PARTICLE_NETWORK_JWT_SECRET: string;
    }
  }
}