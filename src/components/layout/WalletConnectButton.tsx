import React, { useEffect, useState, useMemo } from "react";
import { useConnectKit } from "@particle-network/connect-react-ui";
import { useAccount, useBalance, useChainId, useSwitchChain } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { formatUnits } from "viem";
import { useQuery } from "@tanstack/react-query";
import { getBalance as getEvmBalance } from "@wagmi/core";
import { config } from "@/lib/wagmiConfig";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { Address } from "viem";
import { useParticleProvider } from "@particle-network/connect-react-ui";
import { useSessionKeyManager } from "@particle-network/auth-core-modal";
import { useLocalStorage } from "usehooks-ts";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CopyIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { shortenAddress } from "@/lib/utils";

export function WalletConnectButton() {
  const { connect, disconnect, account, chain, connected } = useConnectKit();
  const { address: evmAddress, isConnected: isEvmConnected } = useAccount();
  const { data: evmBalance } = useBalance({ address: evmAddress });
  const evmChainId = useChainId();
  const { switchChain } = useSwitchChain();

  const { publicKey: solanaPublicKey, connected: isSolanaConnected } =
    useWallet();
  const { connection } = useConnection();
  const { data: solanaBalance, isLoading: isSolanaBalanceLoading } = useQuery({
    queryKey: ["solanaBalance", solanaPublicKey?.toBase58()],
    queryFn: async () => {
      if (!solanaPublicKey) return null;
      const balance = await connection.getBalance(solanaPublicKey);
      return balance / 1e9; // Convert lamports to SOL
    },
    enabled: !!solanaPublicKey,
  });

  const [tonConnectUI] = useTonConnectUI();
  const tonWallet = useTonWallet();
  const isTonConnected = !!tonWallet;
  const [tonBalance, setTonBalance] = useState<string | null>(null);

  useEffect(() => {
    const fetchTonBalance = async () => {
      if (tonWallet && tonConnectUI) {
        try {
          const balance = await tonConnectUI.getBalance(); // Assuming getBalance exists on tonConnectUI
          setTonBalance(formatUnits(balance, 9)); // TON has 9 decimals
        } catch (error) {
          console.error("Failed to fetch TON balance:", error);
          setTonBalance(null);
        }
      }
    };
    fetchTonBalance();
  }, [tonWallet, tonConnectUI]);

  const currentWallet = useMemo(() => {
    if (isEvmConnected && evmAddress) {
      return {
        type: "EVM",
        address: evmAddress,
        balance: evmBalance
          ? `${formatUnits(evmBalance.value, evmBalance.decimals)} ${
              evmBalance.symbol
            }`
          : "0 ETH",
        chain: chain?.name || `Chain ID: ${evmChainId}`,
      };
    } else if (isSolanaConnected && solanaPublicKey) {
      return {
        type: "Solana",
        address: solanaPublicKey.toBase58(),
        balance:
          solanaBalance !== null ? `${solanaBalance.toFixed(4)} SOL` : "0 SOL",
        chain: "Solana",
      };
    } else if (isTonConnected && tonWallet) {
      return {
        type: "TON",
        address: tonWallet.account.address,
        balance: tonBalance !== null ? `${tonBalance} TON` : "0 TON",
        chain: "TON",
      };
    }
    return null;
  }, [
    isEvmConnected,
    evmAddress,
    evmBalance,
    evmChainId,
    isSolanaConnected,
    solanaPublicKey,
    solanaBalance,
    isTonConnected,
    tonWallet,
    tonBalance,
    chain,
  ]);

  const handleDisconnect = () => {
    disconnect();
    toast.info("Wallet disconnected.");
  };

  if (!currentWallet) {
    return <Button onClick={connect}>Connect Wallet</Button>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {currentWallet.type}
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          Address: {shortenAddress(currentWallet.address)}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2 h-5 w-5">
                  <CopyIcon className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy Address</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </DropdownMenuItem>
        <DropdownMenuItem>Balance: {currentWallet.balance}</DropdownMenuItem>
        <DropdownMenuItem>Chain: {currentWallet.chain}</DropdownMenuItem>
        <DropdownMenuItem onClick={handleDisconnect}>
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
