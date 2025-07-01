"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { getSimplifiedMarkets, SimplifiedMarket, PaginatedSimplifiedMarkets } from '@/services/polymarketService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useUserStore } from '@/hooks/useUserStore';
import { SmartBetSuggestion } from '@/services/aiAdapter';
import { toast } from 'sonner';
import { useParticleNetwork } from '@particle-network/connect-react-ui';
import { ethers } from 'ethers';
import PolymarketAdapterABI from '../../../contracts/evm/PolymarketAdapter.json'; // Assuming ABI will be generated here
import { POLYMARKET_ADAPTER_ADDRESS, USDC_ADDRESS } from '@/constants'; // Assuming these constants will be defined

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
            <CardFooter className="pt-4">
              <SmartBetButton market={market} />
            </CardFooter>
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

interface SmartBetButtonProps {
  market: SimplifiedMarket;
}

const SmartBetButton: React.FC<SmartBetButtonProps> = ({ market }) => {
  const { user } = useUserStore();
  const { provider } = useParticleNetwork();
  const [loadingBet, setLoadingBet] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  const handleSmartBetSuggestion = async () => {
    if (!user?.id) {
      toast.error("Please log in to get smart bet suggestions.");
      return;
    }

    setLoadingSuggestion(true);
    try {
      const response = await fetch(`/api/smart-bet?marketId=${market.condition_id}&userId=${user.id}`);
      const data: SmartBetSuggestion | { message: string } = await response.json();

      if (response.ok) {
        const suggestion = data as SmartBetSuggestion;
        toast.success(
          `Smart Bet Suggestion for ${suggestion.marketId}:`,
          {
            description: `Outcome: ${suggestion.outcome}, Amount: $${suggestion.suggestedBetAmount.toFixed(2)}, Confidence: ${(suggestion.confidenceScore * 100).toFixed(0)}%`,
            duration: 5000,
          }
        );
      } else {
        toast.error(`Failed to get smart bet suggestion: ${(data as { message: string }).message}`);
      }
    } catch (error) {
      console.error("Error fetching smart bet:", error);
      toast.error("An unexpected error occurred while fetching smart bet suggestion.");
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handlePlaceBet = async (outcomeIndex: number, amount: number) => {
    if (!provider) {
      toast.error("Please connect your wallet.");
      return;
    }

    setLoadingBet(true);
    try {
      const ethersProvider = new ethers.providers.Web3Provider(provider, "any");
      const signer = ethersProvider.getSigner();

      const adapterContract = new ethers.Contract(
        POLYMARKET_ADAPTER_ADDRESS,
        PolymarketAdapterABI.abi, // Assuming ABI is in .abi property
        signer
      );

      const collateralContract = new ethers.Contract(
        USDC_ADDRESS,
        ["function approve(address spender, uint256 amount) returns (bool)"], // Minimal ABI for approve
        signer
      );

      // Convert amount to USDC decimals (assuming 6 decimals for USDC)
      const amountWei = ethers.utils.parseUnits(amount.toString(), 6);

      // Approve the adapter to spend USDC
      const approveTx = await collateralContract.approve(POLYMARKET_ADAPTER_ADDRESS, amountWei);
      await toast.promise(approveTx.wait(), {
        loading: "Approving USDC...",
        success: "USDC Approved!",
        error: (err) => `Failed to approve USDC: ${err.message}`,
      });

      // Prepare the partition for splitPosition
      const outcomeSlotCount = 2; // Assuming binary market for simplicity (Yes/No)
      const partition = Array(outcomeSlotCount).fill(0);
      partition[outcomeIndex] = 1; // Set 1 for the chosen outcome

      // Encode the message for onZetaMessage (actionType 0 for splitPosition)
      const message = ethers.utils.defaultAbiCoder.encode(
        ["uint8", "bytes32", "uint256[]"],
        [0, market.condition_id, partition]
      );

      // Call onZetaMessage via the adapter (this would typically be a cross-chain call)
      // For direct interaction, we'd call a function on the adapter that wraps this.
      // Assuming a direct call for now for simplicity, but in a real ZetaChain integration,
      // this would involve sending ZRC20 tokens to the adapter with the message.
      // For this frontend, we'll simulate a direct call to the adapter's onZetaMessage for testing purposes.
      // In a real scenario, the user would send ZRC20 to the ZetaChain connector, which then calls onZetaMessage.

      // This part needs to be adjusted based on how the frontend interacts with ZetaChain.
      // For now, let's assume a direct call to a public function on the adapter for betting.
      // We need a public function in PolymarketAdapter.sol that can be called directly from the frontend
      // to initiate a bet, which then internally calls splitPosition.
      // Let's add a `placeBet` function to the contract.

      // For now, we'll simulate the call to onZetaMessage for demonstration.
      // This is NOT how a real ZetaChain integration would work from the frontend.
      // A real integration would involve sending ZRC20 tokens to the ZetaChain connector.

      // Since we don't have a direct `placeBet` function on the adapter yet,
      // and `onZetaMessage` is `external override` and called by ZetaConnector,
      // we cannot directly call it from the frontend.
      // This highlights a missing piece in the smart contract for direct frontend interaction.

      // For the purpose of this task, I will assume there will be a `placeBet` function
      // on the PolymarketAdapter that the frontend can call.
      // I will add a placeholder for it here and note that the contract needs updating.

      // Placeholder for actual bet transaction
      // const tx = await adapterContract.placeBet(market.condition_id, outcomeIndex, amountWei);
      // await toast.promise(tx.wait(), {
      //   loading: "Placing bet...",
      //   success: "Bet Placed Successfully!",
      //   error: (err) => `Failed to place bet: ${err.message}`,
      // });

      toast.info("Betting functionality requires a direct `placeBet` function in the smart contract.");
      toast.success(`Simulated bet of $${amount.toFixed(2)} on outcome ${outcomeIndex} for market ${market.question}`);

    } catch (error) {
      console.error("Error placing bet:", error);
      toast.error("An unexpected error occurred while placing your bet.");
    } finally {
      setLoadingBet(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <Button onClick={handleSmartBetSuggestion} disabled={loadingSuggestion} className="w-full">
        {loadingSuggestion ? 'Getting Suggestion...' : 'Get Smart Bet Suggestion'}
      </Button>
      {/* Example buttons to place a bet directly for demonstration */}
      <Button
        onClick={() => handlePlaceBet(0, 10)} // Bet $10 on outcome 0
        disabled={loadingBet}
        className="w-full"
        variant="outline"
      >
        {loadingBet ? 'Placing Bet...' : 'Place $10 Bet on Outcome 0'}
      </Button>
      <Button
        onClick={() => handlePlaceBet(1, 10)} // Bet $10 on outcome 1
        disabled={loadingBet}
        className="w-full"
        variant="outline"
      >
        {loadingBet ? 'Placing Bet...' : 'Place $10 Bet on Outcome 1'}
      </Button>
    </div>
  );
};
