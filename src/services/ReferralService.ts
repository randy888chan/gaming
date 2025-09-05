import { D1Database } from "@cloudflare/workers-types";

export interface ReferralEarnings {
  particle_user_id: string;
  unpaid_balance_usd: number;
  total_earned_usd: number;
  last_updated: string;
}

export interface UserPreferences {
  particle_user_id: string;
  referrer_id?: string;
  // ... other fields
}

class ReferralService {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Set the referrer for a user
   * @param userId The particle_user_id of the user being referred
   * @param referrerId The particle_user_id of the referrer
   * @returns Boolean indicating success
   */
  async setReferrer(userId: string, referrerId: string): Promise<boolean> {
    try {
      // Verify that both users exist
      const userStmt = this.db.prepare(
        "SELECT particle_user_id FROM user_preferences WHERE particle_user_id = ?"
      );
      
      const userExists = await userStmt.bind(userId).first();
      const referrerExists = await userStmt.bind(referrerId).first();
      
      if (!userExists || !referrerExists) {
        console.error("User or referrer does not exist");
        return false;
      }

      // Update the user's referrer_id
      const stmt = this.db.prepare(
        "UPDATE user_preferences SET referrer_id = ? WHERE particle_user_id = ?"
      );
      
      const result = await stmt.bind(referrerId, userId).run();
      return result.meta.rows_written > 0;
    } catch (error) {
      console.error("Error setting referrer:", error);
      return false;
    }
  }

  /**
   * Calculate and record referral earnings
   * @param userId The particle_user_id of the user who made a play
   * @param playAmount The amount of the play in USD
   * @param referralFeePercentage The percentage of the platform fee to share with the referrer
   * @param platformFeePercentage The platform fee percentage
   * @returns Boolean indicating success
   */
  async recordReferralEarnings(
    userId: string,
    playAmount: number,
    referralFeePercentage: number,
    platformFeePercentage: number
  ): Promise<boolean> {
    try {
      // First, check if the user has a referrer
      const userStmt = this.db.prepare(
        "SELECT referrer_id FROM user_preferences WHERE particle_user_id = ?"
      );
      
      const user = await userStmt.bind(userId).first<{ referrer_id: string }>();
      
      if (!user || !user.referrer_id) {
        // No referrer, nothing to record
        return true;
      }
      
      const referrerId = user.referrer_id;
      
      // Calculate the referral earnings
      const platformFee = playAmount * (platformFeePercentage / 100);
      const referralEarnings = platformFee * (referralFeePercentage / 100);
      
      if (referralEarnings <= 0) {
        return true;
      }
      
      // Insert or update the referral earnings record
      const stmt = this.db.prepare(`
        INSERT INTO referral_earnings 
        (particle_user_id, unpaid_balance_usd, total_earned_usd, last_updated)
        VALUES (?, ?, ?, datetime('now'))
        ON CONFLICT(particle_user_id) DO UPDATE SET
        unpaid_balance_usd = unpaid_balance_usd + ?,
        total_earned_usd = total_earned_usd + ?,
        last_updated = datetime('now')
      `);
      
      await stmt.bind(
        referrerId,
        referralEarnings,
        referralEarnings,
        referralEarnings,
        referralEarnings
      ).run();
      
      return true;
    } catch (error) {
      console.error("Error recording referral earnings:", error);
      return false;
    }
  }

  /**
   * Get referral earnings for a user
   * @param userId The particle_user_id of the user
   * @returns ReferralEarnings object or null if not found
   */
  async getReferralEarnings(userId: string): Promise<ReferralEarnings | null> {
    try {
      const stmt = this.db.prepare(
        "SELECT * FROM referral_earnings WHERE particle_user_id = ?"
      );
      
      const result = await stmt.bind(userId).first<ReferralEarnings>();
      return result || null;
    } catch (error) {
      console.error("Error getting referral earnings:", error);
      return null;
    }
  }

  /**
   * Get users referred by a specific user
   * @param referrerId The particle_user_id of the referrer
   * @returns Array of user IDs referred by the referrer
   */
  async getReferredUsers(referrerId: string): Promise<string[]> {
    try {
      const stmt = this.db.prepare(
        "SELECT particle_user_id FROM user_preferences WHERE referrer_id = ?"
      );
      
      const result = await stmt.bind(referrerId).all<{ particle_user_id: string }>();
      return result.results.map(row => row.particle_user_id);
    } catch (error) {
      console.error("Error getting referred users:", error);
      return [];
    }
  }

  /**
   * Get referral statistics for a user
   * @param userId The particle_user_id of the user
   * @returns Object containing referral statistics
   */
  async getReferralStats(userId: string): Promise<{
    referredCount: number;
    totalEarned: number;
    unpaidBalance: number;
  } | null> {
    try {
      // Get the number of referred users
      const referredCountStmt = this.db.prepare(
        "SELECT COUNT(*) as count FROM user_preferences WHERE referrer_id = ?"
      );
      
      const referredCountResult = await referredCountStmt.bind(userId).first<{ count: number }>();
      
      if (!referredCountResult) {
        return null;
      }
      
      // Get earnings information
      const earningsStmt = this.db.prepare(
        "SELECT total_earned_usd, unpaid_balance_usd FROM referral_earnings WHERE particle_user_id = ?"
      );
      
      const earningsResult = await earningsStmt.bind(userId).first<{
        total_earned_usd: number;
        unpaid_balance_usd: number;
      }>();
      
      return {
        referredCount: referredCountResult.count,
        totalEarned: earningsResult?.total_earned_usd || 0,
        unpaidBalance: earningsResult?.unpaid_balance_usd || 0,
      };
    } catch (error) {
      console.error("Error getting referral stats:", error);
      return null;
    }
  }
}

export default ReferralService;