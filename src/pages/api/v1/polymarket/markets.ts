import type { NextApiRequest, NextApiResponse } from "next";
import { getSimplifiedMarkets } from "@/services/polymarketService";

// Simple in-memory cache
const cache: { data: any; timestamp: number } = {
  data: null,
  timestamp: 0,
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    try {
      // Check if we have valid cached data
      const now = Date.now();
      if (cache.data && now - cache.timestamp < CACHE_TTL) {
        return res.status(200).json({ 
          success: true, 
          markets: cache.data,
          cached: true,
          timestamp: cache.timestamp
        });
      }

      // Fetch fresh data from polymarketService
      const markets = await getSimplifiedMarkets();
      
      // Update cache
      cache.data = markets;
      cache.timestamp = now;
      
      return res.status(200).json({ 
        success: true, 
        markets,
        cached: false,
        timestamp: now
      });
    } catch (error: any) {
      console.error("Error fetching polymarket markets:", error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to fetch polymarket markets" 
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;