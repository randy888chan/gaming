import { ethers } from "ethers";
import { CrossChainSettlement__factory } from "../../contracts/evm/CrossChainSettlement__factory"; // Assuming typechain generation
import { CrossChainSettlement } from "../../contracts/evm/CrossChainSettlement";
import { Client } from "@chainlink/contracts/src/v0.8/ccip/libraries/Client";

export class CrossChainSettlementService {
  private contract: CrossChainSettlement;
  private provider: ethers.Provider;
  private signer: ethers.Signer;

  constructor(
    contractAddress: string,
    routerAddress: string,
    provider: ethers.Provider,
    signer: ethers.Signer
  ) {
    this.provider = provider;
    this.signer = signer;
    this.contract = CrossChainSettlement__factory.connect(
      contractAddress,
      signer
    );
  }

  public async initiateSwap(
    amount: ethers.BigNumber,
    targetChain: string
  ): Promise<string> {
    // In a real scenario, the targetChain would be a Chainlink CCIP chain selector.
    // For this example, we'll use a placeholder string.
    const targetChainBytes32 = ethers.utils.formatBytes32String(targetChain);
    const tx = await this.contract.initiateSwap(amount, targetChainBytes32);
    const receipt = await tx.wait();
    const event = receipt.events?.find((e) => e.event === "SwapInitiated");
    if (!event || !event.args) {
      throw new Error("SwapInitiated event not found");
    }
    return event.args.swapId;
  }

  public async confirmSwap(swapId: string): Promise<void> {
    const tx = await this.contract.confirmSwap(swapId);
    await tx.wait();
  }

  public async cancelSwap(swapId: string): Promise<void> {
    const tx = await this.contract.cancelSwap(swapId);
    await tx.wait();
  }

  public async getSwapDetails(
    swapId: string
  ): Promise<CrossChainSettlement.SwapStructOutput> {
    return this.contract.swaps(swapId);
  }
}
