"use client";

import { Button } from "@/components/ui/button";
import { useConnectKit } from "@particle-network/connectkit";
import { LogIn } from "lucide-react";
import { useTranslation } from "next-i18next";

export function WalletConnectButton() {
  const connectKit = useConnectKit();
  const { t } = useTranslation("common");

  const handleConnect = () => {
    connectKit.openConnectModal();
  };

  return (
    <Button onClick={handleConnect} className="flex items-center gap-2">
      <LogIn className="h-4 w-4" />
      {t("connect_wallet")}
    </Button>
  );
}