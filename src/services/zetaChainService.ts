import { ZetaChainClient, ZetaChainClientParams, EVM_CHAIN_ID } from '@zetachain/toolkit';
import { ethers } from 'ethers'; // @zetachain/toolkit likely uses ethers

// It's good practice to manage RPC URLs and chain IDs via environment variables or constants
const ZETA_ATHENS_3_RPC_URL = process.env.NEXT_PUBLIC_ZETA_TESTNET_RPC_URL || 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public';
const ZETA_ATHENS_3_CHAIN_ID = EVM_CHAIN_ID.ATHENS; // Or 7001 directly

// Helper to get the ethers provider, potentially from Particle's connected wallet
// This is a placeholder; actual provider/signer will come from Particle when a user is connected
const getEthersProvider = async () => {
  // In a real scenario, you'd get this from Particle Network's provider
  // when the user is connected to ZetaChain.
  // Example:
  // if (window.particle && window.particle.ethereum) {
  //   const accounts = await window.particle.ethereum.request({ method: 'eth_accounts' });
  //   if (accounts.length > 0) {
  //     const provider = new ethers.providers.Web3Provider(window.particle.ethereum);
  //     return provider;
  //   }
  // }
  // Fallback to a public RPC for read-only operations if no wallet connected
  return new ethers.providers.JsonRpcProvider(ZETA_ATHENS_3_RPC_URL);
};

const getZetaChainClient = async (): Promise<ZetaChainClient> => {
  const provider = await getEthersProvider();
  const signer = provider.getSigner(); // This will be a dummy signer if using JsonRpcProvider directly

  // Basic parameters for ZetaChainClient
  // The 'network' key here refers to the ZetaChain network identifier ('testnet', 'mainnet')
  // and not the EVM chain name.
  const params: ZetaChainClientParams = {
    network: "testnet", // or "mainnet"
    chains: {
      // Define the EVM chain details for ZetaChain itself
      [EVM_CHAIN_ID.ATHENS]: { // Using the enum for clarity
        jsonRpcUrl: ZETA_ATHENS_3_RPC_URL,
        // The signer is crucial for transactions but can be omitted or a provider used for read-only
        signer: signer, // This needs to be a real signer for transactions
      }
    },
    // Optional: Specify default EVM chain ID for operations if not provided elsewhere
    defaultEvmChainId: EVM_CHAIN_ID.ATHENS,
  };

  return new ZetaChainClient(params);
};

export const getZetaBalance = async (address: string): Promise<string> => {
  try {
    const zetaClient = await getZetaChainClient();
    // The getBalances function in ZetaChainClient might be for ZRC20s or a mix.
    // For native ZETA, it's often a direct ethers.js call if the client doesn't wrap it.
    const provider = await getEthersProvider();
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error('Error fetching ZETA balance:', error);
    throw error;
  }
};

export const getZRC20Balances = async (userAddress: string) => {
  try {
    const zetaClient = await getZetaChainClient();
    // Assuming userAddress is an EVM-compatible address
    // The getBalances function likely targets ZRC20s.
    // It might require the chainId if the client supports multiple chains.
    // The ZetaChainClient's getBalances method might need specific parameters.
    // Looking at the docs: https://www.zetachain.com/docs/developers/frontend/toolkit/Function.getBalances
    // It seems to return balances for all configured chains.
    const balances = await zetaClient.getBalances({
      evmAddress: userAddress,
      // chainId: ZETA_ATHENS_3_CHAIN_ID // Optional if default is set or context implies it
    });
    return balances; // Structure depends on the ZetaChainClient's return type
  } catch (error) {
    console.error('Error fetching ZRC20 balances:', error);
    throw error;
  }
};

// Example of how to use Particle Network's provider with ethers
// This would ideally be in a React context or hook where Particle's state is accessible.
export const getParticleEthersProvider = () => {
  // @ts-ignore
  if (typeof window !== 'undefined' && window.particle && window.particle.ethereum) {
    // @ts-ignore
    return new ethers.providers.Web3Provider(window.particle.ethereum, "any");
  }
  return null;
};

export const getParticleEthersSigner = () => {
  const provider = getParticleEthersProvider();
  if (provider) {
    return provider.getSigner();
  }
  return null;
};

// Modified getZetaChainClient to potentially use Particle's signer
const getZetaChainClientWithSigner = async (): Promise<ZetaChainClient | null> => {
  const particleSigner = getParticleEthersSigner();
  const particleProvider = getParticleEthersProvider();

  if (!particleProvider) {
    console.warn("Particle provider not available. Using public RPC for read-only.");
    // Fallback to public RPC for read-only client
    const publicProvider = new ethers.providers.JsonRpcProvider(ZETA_ATHENS_3_RPC_URL);
    const params: ZetaChainClientParams = {
      network: "testnet",
      chains: { [EVM_CHAIN_ID.ATHENS]: { jsonRpcUrl: ZETA_ATHENS_3_RPC_URL, provider: publicProvider } },
      defaultEvmChainId: EVM_CHAIN_ID.ATHENS,
    };
    return new ZetaChainClient(params);
  }

  // If particle signer is available, use it
  const signerToUse = particleSigner || particleProvider.getSigner(); // Fallback if signer direct access changes

  const params: ZetaChainClientParams = {
    network: "testnet",
    chains: {
      [EVM_CHAIN_ID.ATHENS]: {
        jsonRpcUrl: ZETA_ATHENS_3_RPC_URL, // Can also be derived from particle provider if on ZetaChain
        signer: signerToUse, // This is key for transactions
        provider: particleProvider, // Provide the full provider
      }
    },
    defaultEvmChainId: EVM_CHAIN_ID.ATHENS,
  };
  return new ZetaChainClient(params);
};


// Updated functions to use the new client getter
export const getZetaBalanceWithSigner = async (address: string): Promise<string> => {
  try {
    const zetaClient = await getZetaChainClientWithSigner();
    if (!zetaClient) throw new Error("ZetaChain client not initialized");

    // Try to use Particle's provider directly for balance if available and on the correct network
    const particleProvider = getParticleEthersProvider();
    if (particleProvider) {
        const network = await particleProvider.getNetwork();
        if (network.chainId === ZETA_ATHENS_3_CHAIN_ID) {
            const balance = await particleProvider.getBalance(address);
            return ethers.utils.formatEther(balance);
        }
    }

    // Fallback or if not using Particle's direct provider for this call
    const provider = new ethers.providers.JsonRpcProvider(ZETA_ATHENS_3_RPC_URL);
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);

  } catch (error) {
    console.error('Error fetching ZETA balance:', error);
    throw error;
  }
};

export const getZRC20BalancesWithSigner = async (userAddress: string) => {
  try {
    const zetaClient = await getZetaChainClientWithSigner();
    if (!zetaClient) throw new Error("ZetaChain client not initialized");

    const balances = await zetaClient.getBalances({
      evmAddress: userAddress,
    });
    return balances;
  } catch (error) {
    console.error('Error fetching ZRC20 balances:', error);
    throw error;
  }
};

// TODO: Add functions for contract interactions, cross-chain swaps, messaging, etc.
// For example, a function to interact with a specific ZRC20 token:
// export const getZRC20TokenDetails = async (tokenAddress: string, userAddress: string) => { ... }
