"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { getSimplifiedMarkets, SimplifiedMarket, PaginatedSimplifiedMarkets } from '@/services/polymarketService';
import { Button } from '@/components/ui/button'; // Assuming you have a UI button
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Assuming UI card components

const MarketList: React.FC = () => {
  const [marketsData, setMarketsData] = useState<PaginatedSimplifiedMarkets | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleMarkets, setVisibleMarkets] = useState<SimplifiedMarket[]>([]);
  const [cursor, setCursor] = useState<string | null>(""); // Start with empty cursor for initial load

  const loadMarkets = useCallback(async (currentCursor: string | null) => {
    if (currentCursor === null) return; // No more pages
    setLoading(true);
    setError(null);
    try {
      const data = await getSimplifiedMarkets(currentCursor);
      // Filter for active markets that are not yet closed for a cleaner list
      const activeOpenMarkets = data.data.filter(market => market.active && !market.closed);

      setMarketsData(data); // Store the full pagination response
      setVisibleMarkets(prevMarkets => currentCursor === "" ? activeOpenMarkets : [...prevMarkets, ...activeOpenMarkets]);
      setCursor(data.next_cursor);
    } catch (err) {
      console.error("Error in MarketList component:", err);
      setError('Failed to load markets. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load
    loadMarkets("");
  }, [loadMarkets]);

  const handleLoadMore = () => {
    if (cursor) {
      loadMarkets(cursor);
    }
  };

  if (loading && visibleMarkets.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading Polymarket Markets...</p>
        {/* You could add a spinner here */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
        <p className="text-2xl mb-4">Error</p>
        <p>{error}</p>
        <Button onClick={() => loadMarkets("")} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (visibleMarkets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl">No active markets found on Polymarket at the moment.</p>
        <Button onClick={() => loadMarkets("")} className="mt-4">
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Polymarket Prediction Markets</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleMarkets.map((market) => (
          <Card key={market.condition_id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg line-clamp-2" title={market.question}>{market.question}</CardTitle>
              <CardDescription>Category: {market.category}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-gray-500 mb-1">Ends: {new Date(market.endDate).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500 mb-1">Volume (USD): ${market.volume.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mb-3">Liquidity (USD): ${market.liquidity.toLocaleString()}</p>
              <div className="space-y-2">
                {market.tokens.map(token => (
                  <div key={token.token_id} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                    <span className="text-sm font-medium">{token.outcome}</span>
                    <span className="text-sm font-semibold">${token.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            {/* Future: Add a link to view more details or trade on Polymarket */}
            {/* <CardFooter>
              <a href={`https://polymarket.com/event/${market.slug}`} target="_blank" rel="noopener noreferrer" className="w-full">
                <Button variant="outline" className="w-full">View on Polymarket</Button>
              </a>
            </CardFooter> */}
          </Card>
        ))}
      </div>
      {loading && <p className="text-center mt-4">Loading more markets...</p>}
      {!loading && cursor && (
        <div className="mt-8 text-center">
          <Button onClick={handleLoadMore} variant="secondary">
            Load More Markets
          </Button>
        </div>
      )}
      {!loading && !cursor && visibleMarkets.length > 0 && (
        <p className="text-center mt-8 text-gray-500">You've reached the end of the markets.</p>
      )}
    </div>
  );
};

export default MarketList;
