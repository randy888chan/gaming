import { Wallet, Contract, TransactionResponse, TransactionReceipt } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { parseEther } from '@ethersproject/units';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class ZetaChainSettlement {
  private provider: JsonRpcProvider;
  private wallet: Wallet;
  private contract: Contract;

  constructor(
    rpcUrl: string,
    privateKey: string,
    private contractAddress: string,
    private contractAbi: string,
  ) {
    this.provider = new JsonRpcProvider(rpcUrl);
    this.wallet = new Wallet(privateKey, this.provider as any); // Cast to any to resolve type issue
    this.contract = new Contract(
      this.contractAddress,
      this.contractAbi, // Pass contractAbi directly as string
      this.wallet,
    );
  }

  async settleMarket(
    marketId: string,
    outcome: string,
    amount: string,
  ): Promise<string> {
    try {
      // Use the retry mechanism for the contract interaction
      const tx = await this.retry(async () => {
        // Placeholder for ZetaChain omnichain contract interaction
        // This would involve calling a specific contract method on ZetaChain
        // to initiate the cross-chain settlement.
        const transaction: TransactionResponse = await this.contract.settle(marketId, outcome, parseEther(amount));
        const receipt = await transaction.wait();
        if (receipt) {
          await this.confirmTransaction(receipt.hash);
        }
        return transaction;
      }, 3, 1000); // Retry 3 times with initial 1-second delay (exponential backoff)
      return tx.hash;
    } catch (error: unknown) {
      console.error('Error settling market on ZetaChain:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to settle market: ${error.message}`);
      } else {
        throw new Error(`Failed to settle market: ${String(error)}`);
      }
    }
  }

  private async retry<T>(
    fn: () => Promise<T>,
    retries: number,
    delayMs: number,
  ): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error) {
          const errorCode = (error as any).code;
          if (errorCode === -32000 || errorCode === -32001 || errorCode === -32002 || errorCode === 'REPLACEMENT_UNDERPRICED' || errorCode === 'NONCE_EXPIRED' || errorCode === 'NONCE_TOO_LOW') {
            console.warn(`Chain reorg detected or transaction replaced. Retrying in ${delayMs / 1000}s... Attempt ${i + 1}/${retries}. Error code: ${errorCode}`);
            if (i < retries - 1) {
              await delay(delayMs);
              delayMs *= 2; // Exponential backoff
              continue;
            }
          }
        }
        if (error instanceof Error) {
          throw new Error(`Failed after ${retries} attempts: ${error.message}`);
        } else {
          throw new Error(`Failed after ${retries} attempts: ${String(error)}`);
        }
      }
    }
    throw new Error('Unexpected error in retry mechanism'); // Should not be reached
  }

  private async confirmTransaction(
    txHash: string,
    confirmations: number = 6, // Standard number of confirmations for finality
    timeout: number = 300000, // 5 minutes timeout
    interval: number = 5000, // Check every 5 seconds
  ): Promise<void> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      try {
        const receipt = await this.provider.getTransactionReceipt(txHash);

        if (receipt && receipt.blockNumber) {
          const currentBlock = await this.provider.getBlockNumber();
          if (currentBlock - receipt.blockNumber >= confirmations) {
            console.log(`Transaction ${txHash} confirmed with ${currentBlock - receipt.blockNumber} blocks.`);
            return; // Transaction confirmed
          }
        }
      } catch (error) {
        console.warn(`Error checking transaction receipt for ${txHash}:`, error);
      }
      await delay(interval);
    }
    throw new Error(`Transaction ${txHash} not confirmed after ${timeout / 1000} seconds.`);
  }

  // Add methods for supporting ETH, MATIC, BSC networks if ZetaChain requires specific handling
  // for these chains beyond its omnichain capabilities.
}