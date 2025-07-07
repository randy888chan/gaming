import { ZetaChainSettlement } from './ZetaChainSettlement';

jest.setTimeout(30000); // Set a higher timeout for all tests in this file
import { Wallet, Contract, TransactionResponse, TransactionReceipt } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { parseEther } from '@ethersproject/units';

// Mocking ethers and its components
jest.mock('ethers', () => {
  const originalModule = jest.requireActual('ethers');
  return {
    ...originalModule,
    Wallet: jest.fn().mockImplementation(() => ({
      connect: jest.fn(),
      sendTransaction: jest.fn(),
      signMessage: jest.fn(),
      getAddress: jest.fn().mockReturnValue('0xMockWalletAddress'),
    })),
    Contract: jest.fn().mockImplementation(() => ({
      settle: jest.fn(),
    })),
    BigNumber: {
      from: jest.fn((value) => ({
        _hex: `0x${value.toString(16)}`,
        eq: jest.fn(other => value === other),
      })),
    },
  };
});

jest.mock('@ethersproject/providers', () => ({
  JsonRpcProvider: jest.fn().mockImplementation(() => ({
    getTransactionReceipt: jest.fn(),
    getBlockNumber: jest.fn().mockResolvedValue(100),
  })),
}));

jest.mock('@ethersproject/units', () => {
  const actualEthers = jest.requireActual('ethers');
  return {
    parseEther: jest.fn(amount => {
      const bigNumberValue = actualEthers.utils.parseEther(amount);
      return {
        _hex: bigNumberValue._hex,
        eq: jest.fn(other => bigNumberValue.eq(other)),
      };
    }),
  };
});

describe('ZetaChainSettlement', () => {
  let settlement: ZetaChainSettlement;
  let mockWallet: jest.Mocked<Wallet>;
  let mockContract: jest.Mocked<Contract>;
  let mockProvider: jest.Mocked<JsonRpcProvider>;

  const rpcUrl = 'http://mock-rpc-url.com';
  const privateKey = '0xmockprivatekey';
  const contractAddress = '0xmockcontractaddress';
  const contractAbi = '[]'; // Mock ABI

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Initialize ZetaChainSettlement, which will use the mocked Wallet, Contract, and JsonRpcProvider
    settlement = new ZetaChainSettlement(rpcUrl, privateKey, contractAddress, contractAbi);

    // Get the mocked instances after settlement is initialized
    mockWallet = (Wallet as jest.Mock).mock.results[0].value;
    mockContract = (Contract as jest.Mock).mock.results[0].value;
    mockProvider = (JsonRpcProvider as jest.Mock).mock.results[0].value;
  });

  it('should be initialized correctly', () => {
    expect(JsonRpcProvider).toHaveBeenCalledWith(rpcUrl);
    expect(Wallet).toHaveBeenCalledWith(privateKey, settlement.getProvider());
    expect(Contract).toHaveBeenCalledWith(contractAddress, contractAbi, mockWallet);
    expect(settlement).toBeInstanceOf(ZetaChainSettlement);
  });

  describe('settleMarket', () => {
    it('should successfully settle a market and return transaction hash', async () => { // Increased timeout for this test
      const mockTxHash = '0xmocktxhash123';
      const mockReceipt = { hash: mockTxHash, blockNumber: 95 }; // Simulate 5 confirmations needed (100-95)
      const mockTransactionResponse: TransactionResponse = {
        hash: mockTxHash,
        wait: jest.fn().mockResolvedValue(mockReceipt),
      } as unknown as TransactionResponse;

      mockContract.settle.mockResolvedValue(mockTransactionResponse);
      mockProvider.getTransactionReceipt.mockResolvedValue(mockReceipt);
      mockProvider.getBlockNumber.mockResolvedValue(100); // Current block number

      const marketId = 'market123';
      const outcome = 'outcomeA';
      const amount = '100';

      const result = await settlement.settleMarket(marketId, outcome, amount);

      expect(mockContract.settle).toHaveBeenCalledWith(marketId, outcome, parseEther(amount));
      expect(mockTransactionResponse.wait).toHaveBeenCalled();
      expect(mockProvider.getTransactionReceipt).toHaveBeenCalledWith(mockTxHash);
      expect(mockProvider.getBlockNumber).toHaveBeenCalled();
      expect(result).toBe(mockTxHash);
    });

    it('should retry on specific transaction errors and eventually succeed', async () => { // Increased timeout for this test
      const mockTxHash = '0xmocktxhash456';
      const mockReceipt = { hash: mockTxHash, blockNumber: 95 };
      const mockTransactionResponse: TransactionResponse = {
        hash: mockTxHash,
        wait: jest.fn().mockResolvedValue(mockReceipt),
      } as unknown as TransactionResponse;

      // Simulate a chain reorg error on the first attempt, then succeed
      mockContract.settle
        .mockRejectedValueOnce({ code: -32000, message: 'Chain reorg' })
        .mockResolvedValue(mockTransactionResponse);

      mockProvider.getTransactionReceipt.mockResolvedValue(mockReceipt);
      mockProvider.getBlockNumber.mockResolvedValue(100);

      const marketId = 'market456';
      const outcome = 'outcomeB';
      const amount = '50';

      const result = await settlement.settleMarket(marketId, outcome, amount);

      expect(mockContract.settle).toHaveBeenCalledTimes(2); // Called once for error, once for success
      expect(result).toBe(mockTxHash);
    });

    it('should throw an error if all retries fail', async () => {
      mockContract.settle.mockRejectedValue(new Error('Chain reorg')); // Throw an Error object

      const marketId = 'market789';
      const outcome = 'outcomeC';
      const amount = '200';

      await expect(settlement.settleMarket(marketId, outcome, amount)).rejects.toThrow(
        'Failed to settle market: Failed after 3 attempts: Chain reorg',
      );
      expect(mockContract.settle).toHaveBeenCalledTimes(3); // All 3 retries attempted
    });

    it('should throw a generic error for unknown issues', async () => {
      mockContract.settle.mockRejectedValue(new Error('Something went wrong'));

      const marketId = 'marketABC';
      const outcome = 'outcomeD';
      const amount = '10';

      await expect(settlement.settleMarket(marketId, outcome, amount)).rejects.toThrow(
        'Failed to settle market: Failed after 3 attempts: Something went wrong',
      );
    });

    it('should throw an error if transaction confirmation times out', async () => {
      const mockTxHash = '0xmocktxhashTimeout';
      const mockReceipt = { hash: mockTxHash, blockNumber: 95 };
      const mockTransactionResponse: TransactionResponse = {
        hash: mockTxHash,
        wait: jest.fn().mockResolvedValue(mockReceipt),
      } as unknown as TransactionResponse;

      mockContract.settle.mockResolvedValue(mockTransactionResponse);
      // Simulate no receipt for a few calls, then a receipt that never gets enough confirmations
      mockProvider.getTransactionReceipt
        .mockResolvedValueOnce(null) // First check: no receipt
        .mockResolvedValueOnce(null) // Second check: still no receipt
        .mockResolvedValueOnce(null) // Third check: still no receipt
        .mockResolvedValue(mockReceipt); // Subsequent checks: receipt found but not enough confirmations

      mockProvider.getBlockNumber.mockResolvedValue(100); // Current block number

      // Temporarily set a very short timeout for confirmTransaction in the actual class
      // This is a bit hacky, but allows testing the timeout logic without waiting 5 minutes
      const originalConfirmTransaction = (settlement as any).confirmTransaction;
      (settlement as any).confirmTransaction = jest.fn(async (txHash, confirmations, timeout, interval) => {
        return originalConfirmTransaction.call(settlement, txHash, 1, 100, 10); // 1 confirmation, 100ms timeout, 10ms interval
      });

      const marketId = 'marketTimeout';
      const outcome = 'outcomeE';
      const amount = '1';

      await expect(settlement.settleMarket(marketId, outcome, amount)).rejects.toThrow(
        `Failed to settle market: Transaction ${mockTxHash} not confirmed after 0.1 seconds.`,
      );
      // Restore original confirmTransaction
      (settlement as any).confirmTransaction = originalConfirmTransaction;
    });
  });
});