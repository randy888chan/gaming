import { ClobClient, HttpClient } from "@polymarket/clob-client";

// The REST API base URL for Polymarket CLOB
const CLOB_API_URL = "https://clob.polymarket.com/";

// Initialize the HTTP client for the CLOB
// No API key is needed for public GET endpoints like fetching markets.
const httpClient = new HttpClient(CLOB_API_URL);

// Initialize the ClobClient with the http client
// The second argument for ClobClient is for a signer, which is not needed for public data.
// We pass an undefined or minimal signer-like object if the constructor strictly expects it,
// but typically for read-only operations, it might not be used.
// Consulting the clob-client documentation would clarify the minimal setup for read-only.
// For now, let's assume it can be instantiated without a signer for public calls or httpClient handles it.

// Simpler initialization if ClobClient can directly take the URL or httpClient focuses on public routes
const clobClient = new ClobClient(CLOB_API_URL, undefined as any); // Pass undefined or a mock signer if necessary

export interface SimplifiedMarket {
  condition_id: string;
  question: string; // Assuming question is part of the simplified market data, adjust if not
  slug: string; // Assuming slug is available
  // Define other relevant fields based on the actual structure of SimplifiedMarket from Polymarket
  // For example:
  tokens: Array<{ token_id: string; outcome: string; price: number }>; // Example structure
  category: string;
  active: boolean;
  closed: boolean;
  endDate: string; // Example, might be 'resolve_date' or similar
  volume: number; // Example
  liquidity: number; // Example
  // Add other fields as per the actual API response and what's needed for display
  // price: number; // This might be on a token level or market level
  // outcome_prices: string[]; // Example from some APIs
}

export interface PaginatedSimplifiedMarkets {
  limit: number;
  count: number;
  next_cursor: string | null;
  data: SimplifiedMarket[];
}

/**
 * Fetches a list of simplified markets from Polymarket.
 * @param cursor - The pagination cursor for fetching the next set of results.
 * @returns A promise that resolves to a paginated list of simplified markets.
 */
export const getSimplifiedMarkets = async (
  cursor: string = ""
): Promise<PaginatedSimplifiedMarkets> => {
  try {
    // The clob-client library's getSimplifiedMarkets method might take an object with a cursor
    const response = await clobClient.getSimplifiedMarkets({
      next_cursor: cursor,
    });
    // TODO: Adapt this part to the actual structure returned by clobClient.getSimplifiedMarkets
    // The current PaginatedSimplifiedMarkets and SimplifiedMarket interfaces are placeholders
    // and need to be updated based on the actual data structure from the client.
    // For example, if the client already parses the response into a known type, use that.
    // If it returns raw data, ensure it's transformed/mapped correctly.

    // Assuming the response structure matches or can be adapted to PaginatedSimplifiedMarkets
    // This is a placeholder mapping:
    return {
      limit: response.limit ?? 0, // Adjust based on actual response field names
      count: response.count ?? 0, // Adjust based on actual response field names
      next_cursor: response.next_cursor || null, // Adjust based on actual response field names
      data: response.data.map((market: any) => ({
        condition_id: market.condition_id,
        question: market.question || market.title || "N/A", // Try to find the question/title
        slug: market.slug || market.condition_id, // Use slug or condition_id
        tokens:
          market.tokens?.map((token: any) => ({
            // Ensure tokens exist and map them
            token_id: token.token_id,
            outcome: token.outcome_value || token.name || "Outcome", // Find outcome description
            price: parseFloat(token.price) || 0, // Ensure price is a number
          })) || [],
        category: market.category || "General",
        active: market.active,
        closed: market.closed,
        endDate:
          market.end_date_iso ||
          market.resolve_date_iso ||
          new Date().toISOString(), // Find a suitable date
        volume: parseFloat(market.volume_usd) || 0, // Example field
        liquidity: parseFloat(market.liquidity_usd) || 0, // Example field
      })),
    } as PaginatedSimplifiedMarkets;
  } catch (error) {
    console.error("Error fetching simplified markets from Polymarket:", error);
    // Return an empty or error structure
    return {
      limit: 0,
      count: 0,
      next_cursor: null,
      data: [],
    };
  }
};

/**
 * Constructs the payload for placing a bet on Polymarket via the CrossChainSettlement contract.
 * This function does NOT send the transaction, it only prepares the message bytes.
 * @param conditionId The unique identifier for the market condition.
 * @param outcomeIndex The index of the outcome to bet on (0 for "No", 1 for "Yes" in binary markets).
 * @param amount The amount of collateral to bet.
 * @returns The ABI-encoded message payload as a Uint8Array.
 */
export const placePolymarketBet = (
  conditionId: string,
  outcomeIndex: number,
  amount: bigint // Use bigint for amounts to match Solidity uint256
): Uint8Array => {
  // Define the partition for the bet. In a binary market, this would be
  // [1, 0] for "Yes" and [0, 1] for "No".
  const partition = [BigInt(0), BigInt(0)];
  if (outcomeIndex === 0 || outcomeIndex === 1) {
    partition[outcomeIndex] = BigInt(1);
  } else {
    throw new Error("Invalid outcomeIndex. Must be 0 or 1 for binary markets.");
  }

  // Encode the message for the splitPosition action (actionType 0)
  // The structure matches PolymarketMessagePayload in PolymarketAdapter.sol
  const payload = {
    actionType: 0, // 0 for splitPosition (bet)
    conditionId: conditionId,
    dataArray: partition,
    // amount is not part of the message payload for PolymarketAdapter,
    // it's passed as a separate parameter to dispatchCrossChainCall
  };

  // Use ethers.js defaultAbiCoder to encode the payload
  // The types must match the Solidity struct PolymarketMessagePayload
  const encodedMessage = ethers.utils.defaultAbiCoder.encode(
    ["uint8", "bytes32", "uint256[]"],
    [payload.actionType, payload.conditionId, payload.dataArray]
  );

  return ethers.getBytes(encodedMessage);
};

// You might also want a function to get details for a single market
// export const getMarketDetails = async (conditionId: string) => { ... }
// And functions to get order books if needed
// export const getOrderBook = async (conditionId: string) => { ... }
