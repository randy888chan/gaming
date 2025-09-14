/**
 * pSEO Generator Worker
 * This worker runs on a CRON schedule to generate pSEO content and enqueue it for social posting.
 */

import { generatePSEOContent } from "../../services/aiAdapter";
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
  // Add other bindings as needed
}

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log("pSEO Generator Worker triggered by CRON");

    try {
      // Generate pSEO content using the AI adapter
      const pseoContent = await generatePSEOContent();
      
      if (!pseoContent) {
        console.error("Failed to generate pSEO content");
        return;
      }

      // Store the generated content in the D1 database
      const contentId = await storeContentInDatabase(env.DB, pseoContent);
      
      if (!contentId) {
        console.error("Failed to store content in database");
        return;
      }

      // Enqueue a message to the social post queue
      const queueMessage = {
        contentId: contentId,
        timestamp: new Date().toISOString(),
      };

      await env.SOCIAL_POST_QUEUE.send(queueMessage);
      console.log(`Successfully generated content and enqueued message for content ID: ${contentId}`);
    } catch (error: any) {
      console.error("Error in pSEO Generator Worker:", error);
    }
  },

  async queue(
    batch: MessageBatch<any>,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    // This worker is not expected to receive queue messages
    // The socialPoster worker handles queue messages
    console.log("pSEO Generator Worker received unexpected queue message");
  },
};

/**
 * Store the generated content in the D1 database.
 * @param db The D1 database binding
 * @param content The pSEO content to store
 * @returns The ID of the stored content, or null if storage failed
 */
async function storeContentInDatabase(
  db: D1Database,
  content: any
): Promise<string | null> {
  try {
    // Generate a unique ID for the content
    const contentId = crypto.randomUUID();
    
    // Insert the content into the content_metadata table
    const stmt = db.prepare(
      `INSERT INTO content_metadata 
       (id, urlPath, title, metaDescription, keywords, generatedHtml, imageUrl, generationDate, socialPostQueueId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    
    const urlPath = `/content/${contentId}`;
    const imageUrl = ""; // This would be set when the image is generated
    
    await stmt.bind(
      contentId,
      urlPath,
      content.title,
      content.description,
      content.keywords,
      content.htmlBody,
      imageUrl,
      new Date().toISOString(),
      null // socialPostQueueId will be set when the message is enqueued
    ).run();
    
    return contentId;
  } catch (error: any) {
    console.error("Error storing content in database:", error);
    return null;
  }
}