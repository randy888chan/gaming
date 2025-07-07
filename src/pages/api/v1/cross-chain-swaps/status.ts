import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { CrossChainSettlementService } from '../../../../services/CrossChainSettlementService';

// This would typically come from environment variables or a secure configuration
const CONTRACT_ADDRESS = '0xYourCrossChainSettlementContractAddress';
const ROUTER_ADDRESS = '0xYourCCIPRouterAddress'; // From story file

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { swapId } = req.query;

    if (!swapId || typeof swapId !== 'string') {
        return res.status(400).json({ message: 'Missing or invalid parameter: swapId' });
    }

    try {
        // For read-only operations, a signer is not strictly necessary, but a provider is.
        const provider = new ethers.JsonRpcProvider('YOUR_ETHEREUM_RPC_URL'); // Replace with actual RPC URL
        const signer = new ethers.Wallet(ethers.Wallet.createRandom().privateKey, provider); // Dummy signer for type compatibility

        const settlementService = new CrossChainSettlementService(
            CONTRACT_ADDRESS,
            ROUTER_ADDRESS,
            provider,
            signer
        );

        const swapDetails = await settlementService.getSwapDetails(swapId);

        res.status(200).json({ success: true, swapDetails });
    } catch (error: any) {
        console.error('Error fetching swap status:', error);
        res.status(500).json({ message: 'Failed to fetch swap status', error: error.message });
    }
}