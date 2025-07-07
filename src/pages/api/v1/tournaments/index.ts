import { NextApiRequest, NextApiResponse } from 'next';
import { D1Database } from '@cloudflare/workers-types';
import { LiquidityEngine, GambaLiquidityPool, ParticleLiquidityPool } from '@services/LiquidityEngine';
import { PolymarketAdapter } from '@workers/polymarketZetaChain/PolymarketAdapter';
import { ZetaChainService, Chain } from '@services/zetaChainService'; // Corrected casing

// Using native BigInt for large number operations with ethers v6
// import { BigNumber } from 'ethers'; // No longer needed for ethers v6

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB: D1Database;
      POLYGON_API_KEY: string; // Example for Polygon API key
      POLYGON_API_SECRET: string; // Example for Polygon API secret
    }
  }
}

// Initialize services (these would ideally be dependency injected in a larger app)
const zetaChainService = new ZetaChainService();
const polymarketAdapter = new PolymarketAdapter(
  process.env.POLYGON_API_KEY || 'dummy_key', // Replace with actual key from env
  process.env.POLYGON_API_SECRET || 'dummy_secret', // Replace with actual secret from env
  zetaChainService
);
const liquidityEngine = new LiquidityEngine();

// Register liquidity pools (example, replace with actual contract addresses and providers)
// For a real application, these would be configured based on environment and chain.
liquidityEngine.registerPool('gamba', new GambaLiquidityPool('0xGambaContractAddress', {} as any)); // Replace {} as any with actual provider
liquidityEngine.registerPool('particle', new ParticleLiquidityPool());

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[API] /api/v1/tournaments - Method: ${req.method}`);
  // Prioritize req.db for testing, fallback to process.env.DB for runtime
  const db = (req as any).db || process.env.DB;

  if (!db) {
    return res.status(500).json({ error: 'Database not configured.' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const { id } = req.query || {};
        if (id) {
          const tournament = await db.prepare('SELECT * FROM tournaments WHERE id = ?').bind(id).first();
          return res.status(200).json(tournament || null);
        } else {
          const { results } = await db.prepare('SELECT * FROM tournaments').all();
          return res.status(200).json(results);
        }
      } catch (error: any) {
        console.error('API Error in tournaments GET:', error);
        return res.status(500).json({ error: error.message });
      }
    case 'POST':
      try {
        const { name, format, status, entryFee, entryCurrency, liquidityPoolName, isPolymarketTournament } = req.body;
        if (!name || !format || !status) {
          return res.status(400).json({ error: 'Missing required fields: name, format, status' });
        }

        let polymarketEscrowId: string | undefined;
        if (isPolymarketTournament) {
          if (!entryFee || !entryCurrency) {
            return res.status(400).json({ error: 'Entry fee and currency are required for Polymarket tournaments.' });
          }
          // Assuming entryFee is a string that needs to be converted to BigInt
          const amountBigNumber = BigInt(entryFee);
          // This is a placeholder for the actual Polymarket escrow contract address
          const POLYMARKET_ESCROW_CONTRACT_ADDRESS = '0xPolymarketEscrowContractAddress';
          const escrowResponse = await polymarketAdapter.createEscrow(
            name, // Using tournament name as marketId for simplicity
            amountBigNumber,
            entryCurrency,
            Chain.ETHEREUM, // Assuming entry comes from Ethereum for now
            POLYMARKET_ESCROW_CONTRACT_ADDRESS
          );
          polymarketEscrowId = escrowResponse.escrowId;
        }

        const { success } = await db.prepare(
          'INSERT INTO tournaments (name, format, status, entryFee, entryCurrency, liquidityPoolName, polymarketEscrowId) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(name, format, status, entryFee, entryCurrency, liquidityPoolName, polymarketEscrowId).run();

        if (success) {
          return res.status(201).json({ message: 'Tournament created successfully', polymarketEscrowId });
        } else {
          return res.status(500).json({ error: 'Failed to create tournament' });
        }
      } catch (error: any) {
        console.error('Tournament creation error:', error);
        return res.status(500).json({ error: error.message });
      }
    case 'PUT':
      try {
        const { id, name, format, status, entryFee, entryCurrency, liquidityPoolName, isPolymarketTournament, triggerPayout, payoutAmount, payoutCurrency, payoutRecipient, payoutChain } = req.body;
        if (!id || (!name && !format && !status && !triggerPayout)) {
          return res.status(400).json({ error: 'Missing required fields: id and at least one of name, format, status, or triggerPayout' });
        }
        let query = 'UPDATE tournaments SET';
        const params = [];
        if (name) {
          query += ' name = ?,';
          params.push(name);
        }
        if (format) {
          query += ' format = ?,';
          params.push(format);
        }
        if (status) {
          query += ' status = ?,';
          params.push(status);
        }
        if (entryFee) {
          query += ' entryFee = ?,';
          params.push(entryFee);
        }
        if (entryCurrency) {
          query += ' entryCurrency = ?,';
          params.push(entryCurrency);
        }
        if (liquidityPoolName) {
          query += ' liquidityPoolName = ?,';
          params.push(liquidityPoolName);
        }
        query = query.slice(0, -1); // Remove trailing comma
        query += ' WHERE id = ?';
        params.push(id);
 
        const { success } = await db.prepare(query).bind(...params).run();
        if (success) {
          // Handle liquidity deposit if entryFee and liquidityPoolName are provided
          if (entryFee && entryCurrency && liquidityPoolName) {
            try {
              const amountBigNumber = BigInt(entryFee);
              await liquidityEngine.deposit(liquidityPoolName, amountBigNumber, entryCurrency);
              console.log(`Deposited ${entryFee} ${entryCurrency} to ${liquidityPoolName} for tournament ${id}`);
            } catch (liquidityError: any) {
              console.error(`Failed to deposit liquidity for tournament ${id}:`, liquidityError);
              // Decide how to handle this error: return 500 or just log and continue
            }
          }

          // Handle payout if triggerPayout is true
          if (triggerPayout && payoutAmount && payoutCurrency && payoutRecipient && payoutChain) {
            try {
              const amountBigNumber = BigInt(payoutAmount);
              // Assuming payout comes from the same liquidity pool as entry, or a designated prize pool
              const sourcePoolName = liquidityPoolName || 'gamba'; // Default to gamba if not specified
              await liquidityEngine.withdraw(sourcePoolName, amountBigNumber, payoutCurrency);
              
              // If it's a cross-chain payout, use ZetaChainService
              if (payoutChain !== Chain.ZETACHAIN) { // Assuming ZetaChain is the native chain for internal operations
                await zetaChainService.crossChainTransfer(
                  Chain.ZETACHAIN, // Source is internal ZetaChain representation
                  payoutChain,
                  payoutCurrency,
                  amountBigNumber
                );
              }
              console.log(`Processed payout of ${payoutAmount} ${payoutCurrency} to ${payoutRecipient} on ${payoutChain} for tournament ${id}`);
            } catch (payoutError: any) {
              console.error(`Failed to process payout for tournament ${id}:`, payoutError);
              return res.status(500).json({ error: `Failed to process payout: ${payoutError.message}` });
            }
          }

          return res.status(200).json({ message: 'Tournament updated successfully' });
        } else {
          return res.status(500).json({ error: 'Failed to update tournament' });
        }
      } catch (error: any) {
        console.error('Tournament update error:', error);
        return res.status(500).json({ error: error.message });
      }
    case 'DELETE':
      try {
        const { id } = req.query || {};
        if (!id) {
          return res.status(400).json({ error: 'Missing required field: id' });
        }
        const { success } = await db.prepare('DELETE FROM tournaments WHERE id = ?').bind(id).run();
        if (success) {
          return res.status(200).json({ message: 'Tournament deleted successfully' });
        } else {
          return res.status(500).json({ error: 'Failed to delete tournament' });
        }
      } catch (error: any) {
        console.error('API Error in tournaments DELETE:', error);
        return res.status(500).json({ error: error.message });
      }
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}