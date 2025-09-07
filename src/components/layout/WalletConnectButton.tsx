"use client";

import { Button } from "@/components/ui/button";
import { useModal } from "@particle-network/connectkit";
import { LogIn } from "lucide-react";

export function WalletConnectButton() {
  const { setOpen } = useModal();

  const handleConnect = () => {
    setOpen(true);
  };

  return (
    <Button onClick={handleConnect} className="flex items-center gap-2">
      <LogIn className="h-4 w-4" />
      Connect Wallet
    </Button>
  );
}