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

/**
 * Interface for text generation requests.
 */
export interface GenerationRequest {
  prompt: string;
  // Other options like temperature, max_tokens can be added here
}

/**
 * Interface for text generation responses.
 */
export interface TextGenerationResponse {
  success: boolean;
  content?: string;
  error?: string;
}

/**
 * Interface for pSEO content generation.
 */
export interface PSEOContent {
  title: string;
  description: string;
  keywords: string;
  htmlBody: string;
  imagePrompt: string;
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

/**
 * Function to generate text content using the AI service.
 * @param req The generation request containing the prompt and other options.
 * @returns A Promise that resolves to a TextGenerationResponse.
 */
export async function generateTextContent(
  req: GenerationRequest
): Promise<TextGenerationResponse> {
  try {
    const response = await fetch(`${AI_SERVICE_API_URL}/generate-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": AI_SERVICE_API_KEY,
      },
      body: JSON.stringify(req),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return {
        success: false,
        error: `AI service responded with status ${response.status}: ${errorBody}`,
      };
    }

    const content = await response.text();
    return {
      success: true,
      content,
    };
  } catch (error: any) {
    console.error("Error generating text content:", error);
    return {
      success: false,
      error: error.message || "Failed to generate text content",
    };
  }
}

/**
 * Function to generate pSEO content using the AI service.
 * @returns A Promise that resolves to PSEOContent or null if generation fails.
 */
export async function generatePSEOContent(): Promise<PSEOContent | null> {
  try {
    // First, generate the main content
    const contentResponse = await generateTextContent({
      prompt: "Generate engaging content about prediction markets and blockchain gaming for SEO purposes. Include a title, description, and main body content.",
    });

    if (!contentResponse.success || !contentResponse.content) {
      throw new Error(contentResponse.error || "Failed to generate main content");
    }

    // Then, generate keywords
    const keywordsResponse = await generateTextContent({
      prompt: "Based on this content, generate 10 relevant SEO keywords separated by commas: " + contentResponse.content,
    });

    if (!keywordsResponse.success || !keywordsResponse.content) {
      throw new Error(keywordsResponse.error || "Failed to generate keywords");
    }

    // Finally, generate an image prompt
    const imagePromptResponse = await generateTextContent({
      prompt: "Based on this content, generate a detailed prompt for creating an engaging image: " + contentResponse.content,
    });

    if (!imagePromptResponse.success || !imagePromptResponse.content) {
      throw new Error(imagePromptResponse.error || "Failed to generate image prompt");
    }

    // Parse the content to extract title, description, and body
    // This is a simplified parsing - in a real implementation, you might want more sophisticated parsing
    const lines = contentResponse.content.split('\n');
    const title = lines[0] || "Generated Content";
    const description = lines.slice(1, 3).join(' ') || "Description of the content";
    const htmlBody = `<p>${lines.slice(3).join('</p><p>')}</p>`;

    return {
      title,
      description,
      keywords: keywordsResponse.content,
      htmlBody,
      imagePrompt: imagePromptResponse.content,
    };
  } catch (error: any) {
    console.error("Error generating pSEO content:", error);
    return null;
  }
}

/**
 * Function to generate a social media post variant of content.
 * @param content The base content to transform into a social media post.
 * @returns A Promise that resolves to a string containing the social media post or null if generation fails.
 */
export async function generateSocialPost(content: string): Promise<string | null> {
  try {
    const response = await generateTextContent({
      prompt: `Transform this content into an engaging social media post (under 280 characters): ${content}`,
    });

    if (!response.success || !response.content) {
      throw new Error(response.error || "Failed to generate social media post");
    }

    return response.content;
  } catch (error: any) {
    console.error("Error generating social media post:", error);
    return null;
  }
}