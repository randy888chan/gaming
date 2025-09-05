import ReferralService, { ReferralEarnings, UserPreferences } from '../../src/services/ReferralService';
import { jest } from '@jest/globals';

describe('ReferralService', () => {
  let referralService: ReferralService;
  let mockDb: any;

  beforeEach(() => {
    // Create a mock database object
    mockDb = {
      prepare: jest.fn().mockReturnThis(),
      bind: jest.fn().mockReturnThis(),
      first: jest.fn(),
      all: jest.fn(),
      run: jest.fn(),
    };

    referralService = new ReferralService(mockDb as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setReferrer', () => {
    it('should set referrer successfully when both users exist', async () => {
      // Mock that both users exist
      mockDb.first
        .mockResolvedValueOnce({ particle_user_id: 'user1' }) // user exists
        .mockResolvedValueOnce({ particle_user_id: 'referrer1' }) // referrer exists
        .mockResolvedValueOnce({}); // update result

      mockDb.run.mockResolvedValue({ meta: { rows_written: 1 } });

      const result = await referralService.setReferrer('user1', 'referrer1');

      expect(result).toBe(true);
      expect(mockDb.prepare).toHaveBeenCalledWith(
        'SELECT particle_user_id FROM user_preferences WHERE particle_user_id = ?'
      );
      expect(mockDb.prepare).toHaveBeenCalledWith(
        'UPDATE user_preferences SET referrer_id = ? WHERE particle_user_id = ?'
      );
    });

    it('should return false when user does not exist', async () => {
      // Mock that user doesn't exist
      mockDb.first.mockResolvedValueOnce(null); // user doesn't exist

      const result = await referralService.setReferrer('nonexistent', 'referrer1');

      expect(result).toBe(false);
    });

    it('should return false when referrer does not exist', async () => {
      // Mock that user exists but referrer doesn't
      mockDb.first
        .mockResolvedValueOnce({ particle_user_id: 'user1' }) // user exists
        .mockResolvedValueOnce(null); // referrer doesn't exist

      const result = await referralService.setReferrer('user1', 'nonexistent');

      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      mockDb.first.mockRejectedValue(new Error('Database error'));

      const result = await referralService.setReferrer('user1', 'referrer1');

      expect(result).toBe(false);
    });
  });

  describe('recordReferralEarnings', () => {
    it('should record earnings successfully', async () => {
      // Mock that user has a referrer
      mockDb.first.mockResolvedValue({ referrer_id: 'referrer1' });
      mockDb.run.mockResolvedValue({});

      const result = await referralService.recordReferralEarnings(
        'user1',
        100, // playAmount
        10, // referralFeePercentage
        5 // platformFeePercentage
      );

      expect(result).toBe(true);
      expect(mockDb.prepare).toHaveBeenCalledWith(
        'SELECT referrer_id FROM user_preferences WHERE particle_user_id = ?'
      );
    });

    it('should return true when user has no referrer', async () => {
      // Mock that user has no referrer
      mockDb.first.mockResolvedValue({ referrer_id: null });

      const result = await referralService.recordReferralEarnings(
        'user1',
        100,
        10,
        5
      );

      expect(result).toBe(true);
    });

    it('should return true when referral earnings are zero or negative', async () => {
      // Mock that user has a referrer
      mockDb.first.mockResolvedValue({ referrer_id: 'referrer1' });

      const result = await referralService.recordReferralEarnings(
        'user1',
        0, // Zero play amount
        10,
        5
      );

      expect(result).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      mockDb.first.mockRejectedValue(new Error('Database error'));

      const result = await referralService.recordReferralEarnings(
        'user1',
        100,
        10,
        5
      );

      expect(result).toBe(false);
    });
  });

  describe('getReferralEarnings', () => {
    it('should return earnings when they exist', async () => {
      const mockEarnings: ReferralEarnings = {
        particle_user_id: 'referrer1',
        unpaid_balance_usd: 50,
        total_earned_usd: 100,
        last_updated: new Date().toISOString(),
      };

      mockDb.first.mockResolvedValue(mockEarnings);

      const result = await referralService.getReferralEarnings('referrer1');

      expect(result).toEqual(mockEarnings);
    });

    it('should return null when no earnings exist', async () => {
      mockDb.first.mockResolvedValue(null);

      const result = await referralService.getReferralEarnings('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      mockDb.first.mockRejectedValue(new Error('Database error'));

      const result = await referralService.getReferralEarnings('user1');

      expect(result).toBeNull();
    });
  });

  describe('getReferredUsers', () => {
    it('should return referred users', async () => {
      const mockResults = {
        results: [
          { particle_user_id: 'user1' },
          { particle_user_id: 'user2' },
        ],
      };

      mockDb.all.mockResolvedValue(mockResults);

      const result = await referralService.getReferredUsers('referrer1');

      expect(result).toEqual(['user1', 'user2']);
    });

    it('should return empty array when no referred users exist', async () => {
      mockDb.all.mockResolvedValue({ results: [] });

      const result = await referralService.getReferredUsers('referrer1');

      expect(result).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      mockDb.all.mockRejectedValue(new Error('Database error'));

      const result = await referralService.getReferredUsers('referrer1');

      expect(result).toEqual([]);
    });
  });

  describe('getReferralStats', () => {
    it('should return referral stats', async () => {
      // Mock the referred count
      mockDb.first
        .mockResolvedValueOnce({ count: 5 }) // referred count
        .mockResolvedValueOnce({ total_earned_usd: 100, unpaid_balance_usd: 50 }); // earnings

      const result = await referralService.getReferralStats('referrer1');

      expect(result).toEqual({
        referredCount: 5,
        totalEarned: 100,
        unpaidBalance: 50,
      });
    });

    it('should return null when no stats exist', async () => {
      mockDb.first.mockResolvedValueOnce(null); // no referred count

      const result = await referralService.getReferralStats('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      mockDb.first.mockRejectedValue(new Error('Database error'));

      const result = await referralService.getReferralStats('referrer1');

      expect(result).toBeNull();
    });
  });
});