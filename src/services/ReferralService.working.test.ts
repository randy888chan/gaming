import { jest } from '@jest/globals';
import ReferralService from './ReferralService';

describe('ReferralService', () => {
  it('should be able to import the service', async () => {
    // This is a very basic test just to ensure the file can be imported
    const module = await import('./ReferralService');
    expect(module).toBeDefined();
    expect(typeof module.default).toBe('function');
  });

  describe('ReferralService methods', () => {
    let service: ReferralService;
    let mockDb: any;

    beforeEach(() => {
      // Create a mock database
      mockDb = {
        prepare: jest.fn().mockReturnThis(),
        bind: jest.fn().mockReturnThis(),
        first: jest.fn(),
        run: jest.fn(),
        all: jest.fn(),
      };
      
      service = new ReferralService(mockDb);
    });

    it('should be able to create an instance of ReferralService', () => {
      expect(service).toBeInstanceOf(ReferralService);
    });

    it('should have setReferrer method', () => {
      expect(typeof service.setReferrer).toBe('function');
    });

    it('should have recordReferralEarnings method', () => {
      expect(typeof service.recordReferralEarnings).toBe('function');
    });

    it('should have getReferralEarnings method', () => {
      expect(typeof service.getReferralEarnings).toBe('function');
    });

    it('should have getReferredUsers method', () => {
      expect(typeof service.getReferredUsers).toBe('function');
    });

    it('should have getReferralStats method', () => {
      expect(typeof service.getReferralStats).toBe('function');
    });
  });
});