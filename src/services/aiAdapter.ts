import { AI_SERVICE_API_URL, AI_SERVICE_API_KEY } from "../constants";

/**
 * @file AI Service Adapter
 * @description This file provides an adapter for interacting with the external AI service.
 * It encapsulates the logic for making requests to the AI service and handling its responses.
 */

/**
 * Interface for the Smart Bet suggestion returned by the AI service.
 */
export interface SmartBetSuggestion {
  marketId: string;
  outcome: string; // e.g., "YES" or "NO" for a binary market
  suggestedBetAmount: number;
  confidenceScore: number; // A score indicating the AI's confidence in the suggestion
  reasoning?: string; // Optional explanation for the suggestion
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // 1 second

/**
 * Function to get a smart bet suggestion from the AI service.
 * @param marketId The ID of the market for which to get a suggestion.
 * @param userId The ID of the user requesting the suggestion.
 * @returns A Promise that resolves to a SmartBetSuggestion or null if no suggestion is available.
 */
export async function getSmartBetSuggestion(
  marketId: string,
  userId: string
): Promise<SmartBetSuggestion | null> {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      console.log(
        `Requesting smart bet suggestion for market: ${marketId}, user: ${userId}. Attempt ${
          i + 1
        }/${MAX_RETRIES}`
      );

      const response = await fetch(AI_SERVICE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": AI_SERVICE_API_KEY, // Authentication header
        },
        body: JSON.stringify({ marketId, userId }),
      });

      if (response.status === 429) {
        // Rate limit exceeded, wait and retry
        const retryAfter = response.headers.get("Retry-After");
        const delay = retryAfter
          ? parseInt(retryAfter) * 1000
          : RETRY_DELAY_MS * (i + 1);
        console.warn(`Rate limit hit. Retrying after ${delay / 1000} seconds.`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue; // Retry the request
      }

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `AI service responded with status ${response.status}: ${errorBody}`
        );
      }

      const suggestion: SmartBetSuggestion = await response.json();
      return suggestion;
    } catch (error) {
      console.error(
        `Error fetching smart bet suggestion (attempt ${
          i + 1
        }/${MAX_RETRIES}):`,
        error
      );
      if (i < MAX_RETRIES - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY_MS * (i + 1))
        );
      } else {
        return null; // All retries failed
      }
    }
  }
  return null; // Should not reach here if MAX_RETRIES > 0
}
