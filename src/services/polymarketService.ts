import { ClobClient, Chain } from "@polymarket/clob-client";
import { ethers } from "ethers";

// The REST API base URL for Polymarket CLOB
const CLOB_API_URL = "https://clob.polymarket.com/";

// Initialize the ClobClient with the API URL and required parameters
const clobClient = new ClobClient(CLOB_API_URL, Chain.POLYGON);

// ... existing interfaces and other code ...

/**
 * Fetches a list of simplified markets from Polymarket.
 * @param cursor - The pagination cursor for fetching the next set of results.
 * @returns A promise that resolves to a paginated list of simplified markets.
 */
export const getSimplifiedMarkets = async (
  cursor: string = ""
): Promise<any> => {
  try {
    // Use the official clob-client SDK method
    const response = await clobClient.getSimplifiedMarkets(cursor);
    
    // Return the response directly as it's already in the correct format
    return response;
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
  // Validate conditionId format (should be a valid bytes32 hex string)
  if (!conditionId.startsWith("0x") || conditionId.length !== 66) {
    throw new Error("Invalid conditionId format. Must be a 32-byte hex string.");
  }

  // Validate outcomeIndex (should be 0 or 1 for binary markets)
  if (outcomeIndex !== 0 && outcomeIndex !== 1) {
    throw new Error("Invalid outcomeIndex. Must be 0 or 1 for binary markets.");
  }

  // Validate amount (must be positive)
  if (amount <= BigInt(0)) {
    throw new Error("Amount must be positive");
  }

  // Define the partition for the bet. In a binary market, this would be
  // [1, 0] for "Yes" and [0, 1] for "No".
  const partition = [BigInt(0), BigInt(0)];
  partition[outcomeIndex] = BigInt(1);

  // Encode the message for the splitPosition action (actionType 0)
  // The structure matches PolymarketMessagePayload in PolymarketAdapter.sol
  const payload = {
    actionType: 0, // 0 for splitPosition (bet)
    conditionId: conditionId,
    dataArray: partition,
    // amount is not part of the message payload for PolymarketAdapter,
    // it's passed as a separate parameter to dispatchCrossChainCall
  };

  // Use ethers.js to encode the payload
  // The types must match the Solidity struct PolymarketMessagePayload
  const encodedMessage = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint8", "bytes32", "uint256[]"],
    [payload.actionType, payload.conditionId, payload.dataArray]
  );

  return ethers.getBytes(encodedMessage);
};