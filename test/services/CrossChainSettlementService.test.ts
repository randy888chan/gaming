import { CrossChainSettlementService } from '../../src/services/CrossChainSettlementService';
import { ethers } from 'ethers';
import { jest } from '@jest/globals';

// Mock the CrossChainSettlement__factory
jest.mock('../../contracts/evm/CrossChainSettlement__factory', () => ({
  CrossChainSettlement__factory: {
    connect: jest.fn().mockReturnValue({
      initiateSwap: jest.fn(),
      confirmSwap: jest.fn(),
      cancelSwap: jest.fn(),
      swaps: jest.fn(),
    }),
  },
}));

describe('CrossChainSettlementService', () => {
  let service: CrossChainSettlementService;
  let mockContract: any;
  let mockProvider: any;
  let mockSigner: any;

  beforeEach(() => {
    mockContract = {
      initiateSwap: jest.fn(),
      confirmSwap: jest.fn(),
      cancelSwap: jest.fn(),
      swaps: jest.fn(),
    };

    mockProvider = {};
    mockSigner = {};

    // Reset the mock implementation
    require('../../contracts/evm/CrossChainSettlement__factory').CrossChainSettlement__factory.connect.mockReturnValue(mockContract);

    service = new CrossChainSettlementService(
      '0x1234567890123456789012345678901234567890',
      '0xrouter',
      mockProvider,
      mockSigner
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initiateSwap', () => {
    it('should initiate a swap and return swapId', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({
          events: [{
            event: 'SwapInitiated',
            args: {
              swapId: 'swap-123'
            }
          }]
        })
      };

      mockContract.initiateSwap.mockResolvedValue(mockTx);

      const result = await service.initiateSwap(
        ethers.BigNumber.from('1000000000000000000'),
        'ethereum'
      );

      expect(result).toBe('swap-123');
      expect(mockContract.initiateSwap).toHaveBeenCalledWith(
        ethers.BigNumber.from('1000000000000000000'),
        ethers.utils.formatBytes32String('ethereum')
      );
    });

    it('should throw error when SwapInitiated event is not found', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({
          events: []
        })
      };

      mockContract.initiateSwap.mockResolvedValue(mockTx);

      await expect(service.initiateSwap(
        ethers.BigNumber.from('1000000000000000000'),
        'ethereum'
      )).rejects.toThrow('SwapInitiated event not found');
    });
  });

  describe('confirmSwap', () => {
    it('should confirm a swap', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({})
      };

      mockContract.confirmSwap.mockResolvedValue(mockTx);

      await service.confirmSwap('swap-123');

      expect(mockContract.confirmSwap).toHaveBeenCalledWith('swap-123');
    });
  });

  describe('cancelSwap', () => {
    it('should cancel a swap', async () => {
      const mockTx = {
        wait: jest.fn().mockResolvedValue({})
      };

      mockContract.cancelSwap.mockResolvedValue(mockTx);

      await service.cancelSwap('swap-123');

      expect(mockContract.cancelSwap).toHaveBeenCalledWith('swap-123');
    });
  });

  describe('getSwapDetails', () => {
    it('should get swap details', async () => {
      const mockSwapDetails = {
        id: 'swap-123',
        amount: ethers.BigNumber.from('1000000000000000000'),
        targetChain: ethers.utils.formatBytes32String('ethereum'),
        status: 0
      };

      mockContract.swaps.mockResolvedValue(mockSwapDetails);

      const result = await service.getSwapDetails('swap-123');

      expect(result).toEqual(mockSwapDetails);
      expect(mockContract.swaps).toHaveBeenCalledWith('swap-123');
    });
  });
});