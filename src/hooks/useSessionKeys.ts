import { useEffect, useState } from "react";
import { useSessionKeyManager } from "@particle-network/auth-core-modal";
import { useAccount } from "@particle-network/connectkit";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTonWallet } from "@tonconnect/ui-react";

export function useSessionKeys() {
  const { address: evmAddress, connected: isEvmConnected } = useAccount();
  const { publicKey: solanaPublicKey, connected: isSolanaConnected } =
    useWallet();
  const tonWallet = useTonWallet();
  const isTonConnected = !!tonWallet;

  const {
    sessionKey,
    createSessionKey,
    sendTransactionWithSessionKey,
    clearSessionKey,
    isLoading: isSessionKeyLoading,
    error: sessionKeyError,
  } = useSessionKeyManager();

  const [hasSessionKey, setHasSessionKey] = useState(false);

  useEffect(() => {
    setHasSessionKey(!!sessionKey);
  }, [sessionKey]);

  const generateSessionKey = async () => {
    if (isEvmConnected || isSolanaConnected || isTonConnected) {
      try {
        await createSessionKey();
        setHasSessionKey(true);
        console.log("Session key generated successfully.");
      } catch (error) {
        console.error("Failed to generate session key:", error);
        setHasSessionKey(false);
      }
    } else {
      console.warn("No wallet connected to generate session key.");
    }
  };

  const removeSessionKey = () => {
    clearSessionKey();
    setHasSessionKey(false);
    console.log("Session key cleared.");
  };

  return {
    sessionKey,
    hasSessionKey,
    generateSessionKey,
    sendTransactionWithSessionKey,
    removeSessionKey,
    isSessionKeyLoading,
    sessionKeyError,
  };
}
