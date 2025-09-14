/**
 * Social Poster Worker
 * This worker is triggered by messages from the Cloudflare Queue to post content to social media.
 */

import { generateSocialPost } from "../../services/aiAdapter";
import type {
  D1Database,
  Queue,
  ScheduledController,
  ExecutionContext,
  MessageBatch,
} from "@cloudflare/workers-types";

export interface Env {
  DB: D1Database;
  SOCIAL_POST_QUEUE: Queue;
  ZETACHAIN_RPC_URL: string;
  CROSS_CHAIN_SETTLEMENT_ADDRESS: string;
  ZETACHAIN_PRIVATE_KEY: string;
  // Add other bindings as needed (e.g., for social media APIs)
}

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    // This worker is not expected to be triggered by a schedule
    // It only processes queue messages
    console.log("Social Poster Worker received unexpected scheduled trigger");
  },

  async queue(
    batch: MessageBatch<any>,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    for (const message of batch.messages) {
      try {
        console.log("Processing queue message:", message.id);
        
        // Extract content ID from the message
        const { contentId } = message.body;
        
        if (!contentId) {
          console.error("Message missing contentId");
          continue;
        }

        // Retrieve the content from the database
        const content = await getContentFromDatabase(env.DB, contentId);
        
        if (!content) {
          console.error(`Content not found for ID: ${contentId}`);
          continue;
        }

        // Generate a social media post variant using the AI adapter
        const socialPost = await generateSocialPost(content.title + " " + content.metaDescription);
        
        if (!socialPost) {
          console.error("Failed to generate social media post");
          continue;
        }

        // Post the content to social media
        // Note: In a real implementation, you would integrate with actual social media APIs here
        const postResult = await postToSocialMedia(socialPost, content.imageUrl);
        
        if (postResult.success) {
          console.log(`Successfully posted content ID: ${contentId} to social media`);
          
          // Update the database with the social post queue ID
          await updateContentWithQueueId(env.DB, contentId, message.id);
        } else {
          console.error(`Failed to post content ID: ${contentId} to social media:`, postResult.error);
        }
      } catch (error: any) {
        console.error("Error processing queue message:", error);
        // The message will be retried automatically by Cloudflare Queues
      }
    }
  },
};

/**
 * Retrieve content from the D1 database.
 * @param db The D1 database binding
 * @param contentId The ID of the content to retrieve
 * @returns The content metadata, or null if not found
 */
async function getContentFromDatabase(
  db: D1Database,
  contentId: string
): Promise<any | null> {
  try {
    const stmt = db.prepare(
      "SELECT * FROM content_metadata WHERE id = ?"
    );
    
    const result = await stmt.bind(contentId).first();
    return result;
  } catch (error: any) {
    console.error("Error retrieving content from database:", error);
    return null;
  }
}

/**
 * Update the content metadata with the social post queue ID.
 * @param db The D1 database binding
 * @param contentId The ID of the content to update
 * @param queueId The queue message ID
 * @returns True if successful, false otherwise
 */
async function updateContentWithQueueId(
  db: D1Database,
  contentId: string,
  queueId: string
): Promise<boolean> {
  try {
    const stmt = db.prepare(
      "UPDATE content_metadata SET socialPostQueueId = ? WHERE id = ?"
    );
    
    await stmt.bind(queueId, contentId).run();
    return true;
  } catch (error: any) {
    console.error("Error updating content with queue ID:", error);
    return false;
  }
}

/**
 * Post content to social media.
 * @param content The content to post
 * @param imageUrl Optional image URL to include with the post
 * @returns An object indicating success or failure
 */
async function postToSocialMedia(
  content: string,
  imageUrl?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // In a real implementation, you would integrate with actual social media APIs here
    // For example, Twitter API, Facebook API, etc.
    
    // Simulate posting to social media
    console.log("Posting to social media:", content);
    if (imageUrl) {
      console.log("With image:", imageUrl);
    }
    
    // Simulate a random success/failure for demonstration
    const success = Math.random() > 0.2; // 80% success rate
    
    if (success) {
      return { success: true };
    } else {
      return { success: false, error: "Failed to post to social media" };
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to post to social media" };
  }
}