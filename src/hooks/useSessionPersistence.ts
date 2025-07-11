import { useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import { useConnectKit } from "@particle-network/connectkit/react";
import { useAccount } from "@particle-network/connectkit";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTonWallet } from "@tonconnect/ui-react";

export function useSessionPersistence() {
  const { account, connected } = useAccount();
  const { publicKey: solanaPublicKey, connected: isSolanaConnected } =
    useWallet();
  const tonWallet = useTonWallet();
  const isTonConnected = !!tonWallet;

  const [lastConnectedWallet, setLastConnectedWallet] = useLocalStorage(
    "lastConnectedWallet",
    null
  );
  const [lastSelectedChain, setLastSelectedChain] = useLocalStorage(
    "lastSelectedChain",
    null
  );

  useEffect(() => {
    if (connected && account) {
      setLastConnectedWallet("EVM");
      setLastSelectedChain(account.chainInfo.chainId);
    } else if (isSolanaConnected && solanaPublicKey) {
      setLastConnectedWallet("Solana");
      setLastSelectedChain("Solana"); // Or a more specific Solana chain ID if available
    } else if (isTonConnected && tonWallet) {
      setLastConnectedWallet("TON");
      setLastSelectedChain("TON"); // Or a more specific TON chain ID if available
    } else {
      setLastConnectedWallet(null);
      setLastSelectedChain(null);
    }
  }, [
    connected,
    account,
    isSolanaConnected,
    solanaPublicKey,
    isTonConnected,
    tonWallet,
    setLastConnectedWallet,
    setLastSelectedChain,
  ]);

  return { lastConnectedWallet, lastSelectedChain };
}
