import { D1Database } from '@cloudflare/workers-types';

export interface CreditConfig {
  id: string;
  name: string;
  rules: any;
  created_at: string;
  updated_at: string;
}

class CreditConfigService {
  private db: D1Database;

  constructor() {
    // In Cloudflare Workers, DB would be injected via env
    this.db = (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development' ? mockD1 : process.env.DB) as D1Database;
  }

  async getConfig(id: string): Promise<CreditConfig | null> {
    try {
      const stmt = this.db.prepare('SELECT * FROM credit_configs WHERE id = ?').bind(id);
      const result = await stmt.first();
      return result ? this.parseConfig(result) : null;
    } catch (error) {
      console.error('D1 Error in getConfig:', error);
      throw error;
    }
  }

  async createConfig(data: Omit<CreditConfig, 'id' | 'created_at' | 'updated_at'>): Promise<CreditConfig> {
    try {
      const stmt = this.db.prepare(
        'INSERT INTO credit_configs (name, rules) VALUES (?1, ?2) RETURNING *'
      ).bind(data.name, JSON.stringify(data.rules));
      
      const result = await stmt.first();
      if (!result) throw new Error('Failed to create config');
      return this.parseConfig(result);
    } catch (error) {
      console.error('D1 Error in createConfig:', error);
      throw error;
    }
  }

  async updateConfig(id: string, updates: Partial<Omit<CreditConfig, 'id' | 'created_at' | 'updated_at'>>): Promise<CreditConfig | null> {
    try {
      const setClauses = [];
      const bindings = [];

      if (updates.name !== undefined) {
        setClauses.push('name = ?');
        bindings.push(updates.name);
      }
      if (updates.rules !== undefined) {
        setClauses.push('rules = ?');
        bindings.push(JSON.stringify(updates.rules));
      }

      if (setClauses.length === 0) return this.getConfig(id);

      const query = `
        UPDATE credit_configs
        SET ${setClauses.join(', ')}, updated_at = datetime('now')
        WHERE id = ?
        RETURNING *
      `;
      
      const stmt = this.db.prepare(query)
        .bind(...bindings, id);

      const result = await stmt.first();
      return result ? this.parseConfig(result) : null;
    } catch (error) {
      console.error('D1 Error in updateConfig:', error);
      throw error;
    }
  }

  async deleteConfig(id: string): Promise<boolean> {
    try {
      const stmt = this.db.prepare('DELETE FROM credit_configs WHERE id = ?').bind(id);
      const result = await stmt.run();
      return result.meta.rows_written > 0;
    } catch (error) {
      console.error('D1 Error in deleteConfig:', error);
      throw error;
    }
  }

  private parseConfig(result: any): CreditConfig {
    return {
      id: result.id.toString(),
      name: result.name,
      rules: typeof result.rules === 'string' ? JSON.parse(result.rules) : result.rules,
      created_at: result.created_at,
      updated_at: result.updated_at
    };
  }
}

export interface ICreditConfigService {
  getConfig(id: string): Promise<CreditConfig | null>;
  createConfig(data: Omit<CreditConfig, 'id' | 'created_at' | 'updated_at'>): Promise<CreditConfig>;
  updateConfig(id: string, updates: Partial<Omit<CreditConfig, 'id' | 'created_at' | 'updated_at'>>): Promise<CreditConfig | null>;
  deleteConfig(id: string): Promise<boolean>;
}

// Mock for D1Database in test environment
const mockD1 = {
  prepare: (query: string) => ({
    bind: (...args: any[]) => ({
      first: async (colName?: string) => {
        if (query.includes('SELECT * FROM credit_configs WHERE id = ?')) {
          const [id] = args;
          if (id === 'first-play-free') {
            return {
              id: 'first-play-free',
              name: 'First Play Free',
              rules: { amount: 0.001 },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          }
        }
        return null;
      },
      run: async () => ({ meta: { rows_written: 1 } })
    }),
  })
} as unknown as D1Database;

export const creditConfigService = new CreditConfigService();