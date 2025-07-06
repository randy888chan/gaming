import { Router } from 'itty-router';
import {
  PolymarketAdapter,
  PolymarketMarket,
} from './PolymarketAdapter';
import { ZetaChainSettlement } from './ZetaChainSettlement';

interface Env {
  POLYMARKET_API_KEY: string;
  POLYMARKET_API_SECRET: string;
  ZETACHAIN_RPC_URL: string;
  ZETACHAIN_PRIVATE_KEY: string;
  ZETACHAIN_CONTRACT_ADDRESS: string;
  ZETACHAIN_CONTRACT_ABI: string;
}

const router = Router();

router.get('/api/polymarket/markets', async (request, env: Env) => {
  const adapter = new PolymarketAdapter(
    env.POLYMARKET_API_KEY,
    env.POLYMARKET_API_SECRET,
    // Optional: Configure rate limiting parameters if needed
    // 20, // capacity
    // 10  // refillRate (tokens per second)
  );
  try {
    const markets = await adapter.getMarkets();
    return new Response(JSON.stringify(markets), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
});

router.post('/api/polymarket/settle', async (request, env: Env) => {
  const { marketId, outcome, amount } = await request.json();
  const settlement = new ZetaChainSettlement(
    env.ZETACHAIN_RPC_URL,
    env.ZETACHAIN_PRIVATE_KEY,
    env.ZETACHAIN_CONTRACT_ADDRESS,
    env.ZETACHAIN_CONTRACT_ABI,
  );

  try {
    const txHash = await settlement.settleMarket(marketId, outcome, amount);
    return new Response(JSON.stringify({ txHash }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
});

export default {
  fetch: router.handle,
};