import {
  Wallet,
  Contract,
  TransactionResponse,
  TransactionReceipt,
} from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { parseEther } from "@ethersproject/units";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class ZetaChainSettlement {
  private provider: JsonRpcProvider;
  private wallet: Wallet;
  private contract: Contract;

  constructor(
    rpcUrl: string,
    privateKey: string,
    private contractAddress: string,
    private contractAbi: string
  ) {
    this.provider = new JsonRpcProvider(rpcUrl);
    this.wallet = new Wallet(privateKey, this.provider as any); // Cast to any to resolve type issue
    this.contract = new Contract(
      this.contractAddress,
      this.contractAbi, // Pass contractAbi directly as string
      this.wallet
    );
  }

  // Expose provider for testing purposes
  public getProvider(): JsonRpcProvider {
    return this.provider;
  }

  async settleMarket(
    marketId: string,
    outcome: string,
    amount: string
  ): Promise<string> {
    try {
      // Use the retry mechanism for the contract interaction
      const tx = await this.retry(
        async () => {
          // Placeholder for ZetaChain omnichain contract interaction
          // This would involve calling a specific contract method on ZetaChain
          // to initiate the cross-chain settlement.
          const transaction: TransactionResponse = await this.contract.settle(
            marketId,
            outcome,
            parseEther(amount)
          );
          const receipt = await transaction.wait();
          if (receipt) {
            await this.confirmTransaction(receipt.hash);
          }
          return transaction;
        },
        3,
        1000
      ); // Retry 3 times with initial 1-second delay (exponential backoff)
      return tx.hash;
    } catch (error: unknown) {
      console.error("Error settling market on ZetaChain:", error);
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
    delayMs: number
  ): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error: unknown) {
        // Check if it's a known, specific error type for detailed logging
        if (error && typeof error === "object" && "code" in error) {
          const errorCode = (error as any).code;
          if (
            errorCode === -32000 ||
            errorCode === -32001 ||
            errorCode === -32002 ||
            errorCode === "REPLACEMENT_UNDERPRICED" ||
            errorCode === "NONCE_EXPIRED" ||
            errorCode === "NONCE_TOO_LOW"
          ) {
            console.warn(
              `Chain reorg detected or transaction replaced. Retrying in ${
                delayMs / 1000
              }s... Attempt ${i + 1}/${retries}. Error code: ${errorCode}`
            );
          } else {
            // Log a generic retry message for other errors if we are going to retry
            if (i < retries - 1) {
              const errorMessage =
                error instanceof Error ? error.message : String(error);
              console.warn(
                `Attempt ${
                  i + 1
                }/${retries} failed with error: ${errorMessage}. Retrying in ${
                  delayMs / 1000
                }s...`
              );
            }
          }
        } else {
          // Log a generic retry message if error has no 'code' property and we are going to retry
          if (i < retries - 1) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            console.warn(
              `Attempt ${
                i + 1
              }/${retries} failed with error: ${errorMessage}. Retrying in ${
                delayMs / 1000
              }s...`
            );
          }
        }

        // If more retries are available, delay and continue
        if (i < retries - 1) {
          await delay(delayMs);
          delayMs *= 2; // Exponential backoff
          continue; // Continue to the next retry attempt
        }

        // If all retries have been exhausted, re-throw the error
        // This part will only be reached on the last attempt if it also fails
        const finalErrorMessage =
          error instanceof Error
            ? error.message
            : error && typeof error === "object" && "message" in error
            ? (error as any).message
            : String(error);
        // Ensure the error message reflects the total number of retries, not i + 1
        throw new Error(
          `Failed after ${retries} attempts: ${finalErrorMessage}`
        );
      }
    }
    // This line should ideally not be reached if retries > 0,
    // but acts as a fallback for an exhausted loop without success or proper error throw.
    throw new Error(
      `Unexpected error in retry mechanism: All ${retries} retries failed without throwing properly.`
    );
  }

  private async confirmTransaction(
    txHash: string,
    confirmations: number = 6, // Standard number of confirmations for finality
    timeout: number = 300000, // 5 minutes timeout
    interval: number = 5000 // Check every 5 seconds
  ): Promise<void> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      try {
        const receipt = await this.provider.getTransactionReceipt(txHash);

        if (receipt && receipt.blockNumber) {
          const currentBlock = await this.provider.getBlockNumber();
          if (currentBlock - receipt.blockNumber >= confirmations) {
            console.log(
              `Transaction ${txHash} confirmed with ${
                currentBlock - receipt.blockNumber
              } blocks.`
            );
            return; // Transaction confirmed
          }
        }
      } catch (error) {
        console.warn(
          `Error checking transaction receipt for ${txHash}:`,
          error
        );
      }
      await delay(interval);
    }
    throw new Error(
      `Transaction ${txHash} not confirmed after ${timeout / 1000} seconds.`
    );
  }

  // Add methods for supporting ETH, MATIC, BSC networks if ZetaChain requires specific handling
  // for these chains beyond its omnichain capabilities.
}
