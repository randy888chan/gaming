import { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import { CrossChainSettlementService } from "../../../../services/CrossChainSettlementService";

// This would typically come from environment variables or a secure configuration
const CONTRACT_ADDRESS = "0xYourCrossChainSettlementContractAddress";
const ROUTER_ADDRESS = "0xYourCCIPRouterAddress"; // From story file

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { amount, targetChain, privateKey } = req.body;

  if (!amount || !targetChain || !privateKey) {
    return res
      .status(400)
      .json({
        message: "Missing required parameters: amount, targetChain, privateKey",
      });
  }

  try {
    // In a production environment, never handle private keys directly on the backend.
    // This is for demonstration purposes. Use a secure key management solution.
    const provider = new ethers.JsonRpcProvider("YOUR_ETHEREUM_RPC_URL"); // Replace with actual RPC URL
    const signer = new ethers.Wallet(privateKey, provider);

    const settlementService = new CrossChainSettlementService(
      CONTRACT_ADDRESS,
      ROUTER_ADDRESS,
      provider,
      signer
    );

    const amountBigNumber = ethers.parseUnits(amount.toString(), "ether"); // Assuming amount is in ETH
    const swapId = await settlementService.initiateSwap(
      amountBigNumber,
      targetChain
    );

    res.status(200).json({ success: true, swapId });
  } catch (error: any) {
    console.error("Error initiating swap:", error);
    res
      .status(500)
      .json({ message: "Failed to initiate swap", error: error.message });
  }
}
