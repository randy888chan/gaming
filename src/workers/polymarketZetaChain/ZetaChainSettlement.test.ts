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
  const originalEthersProjectUnits = jest.requireActual('@ethersproject/units');
  return {
    __esModule: true,
    // Spread other potential exports from '@ethersproject/units' if any are used
    ...originalEthersProjectUnits,
    parseEther: jest.fn(amount => {
      // Use the actual parseEther from the same package the main code uses
      const bigNumberValue = originalEthersProjectUnits.parseEther(amount);
      // Return a structure that's compatible with ethers.BigNumber and what tests/code might expect
      return {
        _hex: bigNumberValue._hex, // ethers.BigNumber has ._hex
        toString: () => bigNumberValue.toString(), // For logging or string conversion
        eq: jest.fn(other => bigNumberValue.eq(other)), // Mock eq for testing if needed
        // If eq doesn't need to be a jest.fn(), this is simpler:
        // eq: other => bigNumberValue.eq(other),
        // Or even just return bigNumberValue itself if it's a full BigNumber object and
        // no specific jest.fn() capabilities are needed for its methods.
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
      // To satisfy confirmTransaction quickly: currentBlock (100) - receipt.blockNumber (e.g., 94) >= confirmations (default 6)
      const mockReceipt = { hash: mockTxHash, blockNumber: 94, status: 1 }; // status: 1 for success
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

      expect(mockContract.settle).toHaveBeenCalledWith(
        marketId,
        outcome,
        expect.objectContaining({ _hex: '0x056bc75e2d63100000' }) // amount was '100'
      );
      expect(mockTransactionResponse.wait).toHaveBeenCalled();
      expect(mockProvider.getTransactionReceipt).toHaveBeenCalledWith(mockTxHash);
      expect(mockProvider.getBlockNumber).toHaveBeenCalled();
      expect(result).toBe(mockTxHash);
    });

    it('should retry on specific transaction errors and eventually succeed', async () => { // Increased timeout for this test
      const mockTxHash = '0xmocktxhash456';
      // To satisfy confirmTransaction quickly: currentBlock (100) - receipt.blockNumber (e.g., 94) >= confirmations (default 6)
      const mockReceipt = { hash: mockTxHash, blockNumber: 94, status: 1 }; // status: 1 for success
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
      // transaction.wait() needs to resolve to a receipt for confirmTransaction to be called.
      // Add status: 1 to indicate the transaction itself was successful before confirmation timing out.
      const mockReceipt = { hash: mockTxHash, blockNumber: 95, status: 1 };
      const mockTransactionResponse: TransactionResponse = {
        hash: mockTxHash,
        wait: jest.fn().mockResolvedValue(mockReceipt), // Mock wait() to resolve successfully
      } as unknown as TransactionResponse;

      // Mock contract.settle to resolve with the above response for each attempt.
      // It will be called multiple times due to the retry mechanism.
      mockContract.settle.mockResolvedValue(mockTransactionResponse);

      // Mock the confirmTransaction method to simulate a timeout by rejecting.
      // This mock will be used for all calls to confirmTransaction.
      const originalConfirmTransaction = (settlement as any).confirmTransaction;
      const timeoutErrorMessage = `Transaction ${mockTxHash} not confirmed after 0.1 seconds.`;
      const timeoutError = new Error(timeoutErrorMessage);
      (settlement as any).confirmTransaction = jest.fn().mockRejectedValue(timeoutError);

      const marketId = 'marketTimeout';
      const outcome = 'outcomeE';
      const amount = '1';

      // The settleMarket method will attempt the operation 3 times due to the retry logic.
      // Each attempt will call confirmTransaction, which will throw the timeoutError.
      // After 3 failed attempts, the retry logic will throw an error,
      // which is then caught by settleMarket's catch block.
      await expect(settlement.settleMarket(marketId, outcome, amount)).rejects.toThrow(
        `Failed to settle market: Failed after 3 attempts: ${timeoutErrorMessage}`,
      );

      // Verify that contract.settle was called 3 times.
      expect(mockContract.settle).toHaveBeenCalledTimes(3);
      // Verify that confirmTransaction was called 3 times.
      expect((settlement as any).confirmTransaction).toHaveBeenCalledTimes(3);
      // Verify confirmTransaction was called with the correct hash each time.
      expect((settlement as any).confirmTransaction).toHaveBeenCalledWith(mockTxHash);


      // Restore original confirmTransaction
      (settlement as any).confirmTransaction = originalConfirmTransaction;
    });
  });
});