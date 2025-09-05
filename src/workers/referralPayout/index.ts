/**
 * Referral Payout Worker
 * This worker runs on a CRON schedule to process referral payouts.
 */

import { zetaChainService } from "../../services/zetaChainService";

export interface Env {
  DB: D1Database;
  // Add other bindings as needed
}

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log("Referral Payout Worker triggered by CRON");

    try {
      // Process referral payouts
      await processReferralPayouts(env.DB);
    } catch (error: any) {
      console.error("Error in Referral Payout Worker:", error);
    }
  },

  async queue(
    batch: MessageBatch<any>,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    // This worker is not expected to receive queue messages
    console.log("Referral Payout Worker received unexpected queue message");
  },
};

/**
 * Process referral payouts for users with sufficient unpaid balances.
 * @param db The D1 database binding
 */
async function processReferralPayouts(db: D1Database): Promise<void> {
  try {
    // Define the minimum payout threshold (e.g., 1 USDC)
    const PAYOUT_THRESHOLD = 1.0;
    
    // Find users with unpaid balances above the threshold
    const stmt = db.prepare(
      "SELECT particle_user_id, unpaid_balance_usd FROM referral_earnings WHERE unpaid_balance_usd >= ?"
    );
    
    const result = await stmt.bind(PAYOUT_THRESHOLD).all<{
      particle_user_id: string;
      unpaid_balance_usd: number;
    }>();
    
    console.log(`Found ${result.results.length} users eligible for referral payouts`);
    
    for (const earnings of result.results) {
      try {
        // Get the user's wallet address
        const userStmt = db.prepare(
          "SELECT wallet_address FROM user_preferences WHERE particle_user_id = ?"
        );
        
        const user = await userStmt.bind(earnings.particle_user_id).first<{
          wallet_address: string;
        }>();
        
        if (!user || !user.wallet_address) {
          console.error(`No wallet address found for user ${earnings.particle_user_id}`);
          continue;
        }
        
        // Process the payout using zetaChainService
        const cctxHash = await zetaChainService.sendTransaction(
          user.wallet_address,
          "USDC", // Asset
          earnings.unpaid_balance_usd.toString(), // Amount
          "ZETA", // Chain (this would need to be configurable)
          "USDC"  // Destination chain (this would need to be configurable)
        );
        
        if (cctxHash) {
          // Record the payout in the zetachain_cctx_log table
          const logStmt = db.prepare(`
            INSERT INTO zetachain_cctx_log 
            (cctx_hash, source_chain, destination_chain, asset, amount, status)
            VALUES (?, ?, ?, ?, ?, ?)
          `);
          
          await logStmt.bind(
            cctxHash,
            "ZETA", // Source chain
            "USDC", // Destination chain
            "USDC", // Asset
            earnings.unpaid_balance_usd.toString(), // Amount
            "pending" // Status
          ).run();
          
          // Update the referral_earnings table to reflect the paid out balance
          const updateStmt = db.prepare(`
            UPDATE referral_earnings 
            SET unpaid_balance_usd = 0, last_updated = datetime('now')
            WHERE particle_user_id = ?
          `);
          
          await updateStmt.bind(earnings.particle_user_id).run();
          
          console.log(`Successfully processed payout for user ${earnings.particle_user_id}: ${cctxHash}`);
        } else {
          console.error(`Failed to process payout for user ${earnings.particle_user_id}`);
        }
      } catch (error: any) {
        console.error(`Error processing payout for user ${earnings.particle_user_id}:`, error);
      }
    }
  } catch (error: any) {
    console.error("Error processing referral payouts:", error);
  }
}