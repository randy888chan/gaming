/**
 * Test for zetaChainService
 */

// Mock the TypeChain factories since they're not available in test environment
jest.mock('../../typechain-types/factories/contracts/evm/CrossChainSettlement__factory', () => {
  return {
    CrossChainSettlement__factory: {
      connect: jest.fn().mockReturnValue({
        dispatchCrossChainCall: jest.fn().mockResolvedValue({
          hash: '0x1234567890abcdef',
          wait: jest.fn().mockResolvedValue({ status: 1 })
        })
      })
    }
  };
});

import { ZetaChainService, Chain, TxStatus } from './zetaChainService';

describe('zetaChainService', () => {
  it('should be able to import the service', async () => {
    // This is a very basic test just to ensure the file can be imported
    expect(typeof ZetaChainService).toBe('function');
    expect(typeof Chain).toBe('object');
    expect(typeof TxStatus).toBe('object');
  });

  describe('ZetaChainService class', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
      originalEnv = process.env;
      // Set up environment variables needed for the service
      process.env.ZETACHAIN_PRIVATE_KEY = '0x1234567890123456789012345678901234567890123456789012345678901234';
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should have ZetaChainService class', () => {
      expect(typeof ZetaChainService).toBe('function');
    });

    it('should have Chain enum', () => {
      expect(typeof Chain).toBe('object');
    });

    it('should have TxStatus enum', () => {
      expect(typeof TxStatus).toBe('object');
    });

    it('should be able to create an instance of ZetaChainService', () => {
      const config = {
        zetaChainRpcUrl: 'https://zetachain-evm.blockpi.network/v1/rpc/public',
        crossChainSettlementAddress: '0x1234567890123456789012345678901234567890'
      };
      
      expect(() => new ZetaChainService(config)).not.toThrow();
    });

    it('should be able to call dispatchCrossChainCall method', async () => {
      const config = {
        zetaChainRpcUrl: 'https://zetachain-evm.blockpi.network/v1/rpc/public',
        crossChainSettlementAddress: '0x1234567890123456789012345678901234567890'
      };
      
      const service = new ZetaChainService(config);
      const result = await service.dispatchCrossChainCall(
        '0xinputToken',
        BigInt(1000000000000000000n), // 1 token
        '0xtargetToken',
        '0xrecipient',
        true
      );
      
      expect(result).toBeDefined();
      expect(result.hash).toBe('0x1234567890abcdef');
    });
  });
});