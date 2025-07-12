import { ZetaChainService } from '../../src/services/zetaChainService';
import { ethers } from 'ethers';
import { jest } from '@jest/globals';

describe('ZetaChainService', () => {
  let service: ZetaChainService;
  const mockConfig = {
    zetaChainRpcUrl: 'http://localhost:8545',
    crossChainSettlementAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
  };

  // Mock the contract methods
  const mockDispatchCrossChainCall = jest.fn();
  const mockContract = {
    dispatchCrossChainCall: mockDispatchCrossChainCall
  };

  beforeEach(() => {
    jest.spyOn(ethers, 'Wallet').mockImplementation(() => ({} as any));
    jest.spyOn(ethers, 'JsonRpcProvider').mockImplementation(() => ({} as any));
    
    // Mock the contract factory
    jest.spyOn(require('../../typechain-types/factories/contracts/evm/CrossChainSettlement__factory'), 'CrossChainSettlement__factory')
      .mockImplementation(() => ({
        connect: () => mockContract
      }));

    service = new ZetaChainService(mockConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('dispatchCrossChainCall', () => {
    it('should convert EVM address to bytes and call contract', async () => {
      const mockAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      const mockTxResponse = { hash: '0x123' };
      mockDispatchCrossChainCall.mockResolvedValue(mockTxResponse);

      const result = await service.dispatchCrossChainCall(
        '0xinputToken',
        BigInt(100),
        '0xtargetToken',
        mockAddress,
        true
      );

      expect(mockDispatchCrossChainCall).toHaveBeenCalledWith(
        '0xinputToken',
        BigInt(100),
        '0xtargetToken',
        ethers.getBytes(mockAddress),
        true
      );
      expect(result).toEqual(mockTxResponse);
    });

    it('should accept Uint8Array recipient', async () => {
      const mockBytes = new Uint8Array([1,2,3]);
      const mockTxResponse = { hash: '0x123' };
      mockDispatchCrossChainCall.mockResolvedValue(mockTxResponse);

      const result = await service.dispatchCrossChainCall(
        '0xinputToken',
        BigInt(100),
        '0xtargetToken',
        mockBytes,
        false
      );

      expect(mockDispatchCrossChainCall).toHaveBeenCalledWith(
        '0xinputToken',
        BigInt(100),
        '0xtargetToken',
        mockBytes,
        false
      );
      expect(result).toEqual(mockTxResponse);
    });

    it('should reject invalid recipient format', async () => {
      await expect(service.dispatchCrossChainCall(
        '0xinputToken',
        BigInt(100),
        '0xtargetToken',
        'invalid',
        true
      )).rejects.toThrow('Invalid recipient format');
    });
  });

  describe('getTransactionStatus', () => {
    test.todo('should return transaction status');
  });

  describe('depositToZetaChain', () => {
    test.todo('should deposit funds to ZetaChain');
  });

  describe('withdrawFromZetaChain', () => {
    test.todo('should withdraw funds from ZetaChain');
  });
});