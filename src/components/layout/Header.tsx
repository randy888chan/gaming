"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronDown,
  ClipboardCopy,
  LogOut,
  User,
  Home,
  Gamepad,
  BarChart,
  Info,
  Languages,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NexusOrb } from "@/components/NexusOrb";
import {
  GambaPlatformContext,
  TokenValue,
  useCurrentPool,
  useCurrentToken,
  useReferral,
  useTokenBalance,
} from "gamba-react-ui-v2";
import { PLATFORM_REFERRAL_FEE, TOKENLIST } from "@/constants";
import React, { useCallback, useState } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useUserStore } from "@/hooks/useUserStore";
import { WalletConnectButton } from "./WalletConnectButton";
import { useAccount } from "@particle-network/connectkit";

export default function Header() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { i18n } = useTranslation();
  const context = React.useContext(GambaPlatformContext);
  const { address, connected } = useAccount();
  const pool = useCurrentPool();
  const token = useCurrentToken();
  const balance = useTokenBalance();
  const {
    referrerAddress,
    isOnChain,
    referralStatus,
    referralLink,
    copyLinkToClipboard,
    clearCache,
  } = useReferral();

  const [showBonusHelp, setShowBonusHelp] = useState(false);
  const [showJackpotHelp, setShowJackpotHelp] = useState(false);

  const { isPriorityFeeEnabled, priorityFee, set } = useUserStore((state) => ({
    isPriorityFeeEnabled: state.isPriorityFeeEnabled,
    priorityFee: state.priorityFee,
    set: state.set,
  }));
  const [newPriorityFee, setNewPriorityFee] = useState(priorityFee);

  const handleSetPriorityFee = useCallback(() => {
    try {
      set({ priorityFee: newPriorityFee });
      toast.success(`Priority fee set to ${newPriorityFee}`);
    } catch (error) {
      toast.error("Error setting priority fee");
      console.error("Error setting priority fee:", error);
    }
  }, [newPriorityFee, set]);

  const handleSetToken = (token: any) => {
    try {
      if (token && token.poolAuthority) {
        context.setPool(token.mint, token.poolAuthority);
      } else {
        context.setPool(token.mint);
      }
      toast.success(`Token set to ${token.name}`);
    } catch (error) {
      toast.error("Error setting token");
    }
  };

  const copyInvite = () => {
    if (!connected) {
      // We'll implement this properly once we have the ConnectKit modal
      toast.error("Please connect your wallet first");
      return;
    }
    // In a real implementation, we would use the actual referral system
    const referralLink = `${window.location.origin}?ref=${address}`;
    navigator.clipboard.writeText(referralLink);
    toast.success(
      `Copied! Share your link to earn a ${
        PLATFORM_REFERRAL_FEE * 100
      }% fee when players use this platform`
    );
  };

  const truncateString = (s: string, startLen = 4, endLen = startLen) =>
    s ? `${s.slice(0, startLen)}...${s.slice(-endLen)}` : "";

  return (
    <>
      <div className="flex items-center justify-between w-full p-2.5 fixed top-0 left-0 z-50 rounded-b-2xl bg-background border border-t-0 shadow-lg">
        <div className="absolute top-0 left-0 right-0 backdrop-blur w-full h-full rounded-b-2xl -z-20" />
        <div className="flex gap-2 items-center">
          <NexusOrb
            href="/"
            label={t("home")}
            icon={<Home />}
            isActive={router.pathname === "/"}
          />
          <NexusOrb
            href="/profile"
            label={t("profile")}
            icon={<User />}
            isActive={router.pathname === "/profile"}
          />
          <NexusOrb
            href="/polymarket"
            label={t("polymarket")}
            icon={<BarChart />}
            isActive={router.pathname === "/polymarket"}
          />
          <NexusOrb
            href="/games"
            label={t("games")}
            icon={<Gamepad />}
            isActive={router.pathname === "/games"}
          />
          <NexusOrb
            href="/info"
            label={t("info")}
            icon={<Info />}
            isActive={router.pathname === "/info"}
          />
        </div>
        <div className="max-sm:text-xs max-sm:gap-1 flex gap-2.5 items-center relative">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Languages className="h-4 w-4" />
                <span>{i18n.language?.toUpperCase()}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[300px]">
              <DialogHeader>
                <DialogTitle>{t("language")}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[200px] rounded-md border p-4">
                <div className="space-y-2">
                  {router.locales?.map((locale: string) => (
                    <button
                      key={locale}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg w-full text-left hover:bg-accent"
                      onClick={() =>
                        router.push(router.asPath, router.asPath, { locale })
                      }
                    >
                      {locale.toUpperCase()}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <Dialog open={showBonusHelp} onOpenChange={setShowBonusHelp}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("bonus_title")}</DialogTitle>
              </DialogHeader>
              <p>
                {t("bonus_description_part1")}{" "}
                <b>
                  <TokenValue amount={balance.bonusBalance} />
                </b>{" "}
                {t("bonus_description_part2")}
              </p>
            </DialogContent>
          </Dialog>

          <Dialog open={showJackpotHelp} onOpenChange={setShowJackpotHelp}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {token.name} {t("jackpot_details_title")}
                </DialogTitle>
              </DialogHeader>
              {pool.jackpotBalance > 0 && (
                <div className="flex text-[#003c00] rounded-lg bg-[#03ffa4] px-2.5 py-0.5 uppercase font-bold">
                  <TokenValue amount={pool.jackpotBalance} />
                </div>
              )}
              <div className="mt-4">
                <p>{t("jackpot_description")}</p>
                <div className="mt-4">
                  <div>
                    <strong>{t("pool_fee")}:</strong> {pool.poolFee}%
                  </div>
                  <div>
                    <strong>{t("liquidity")}:</strong>{" "}
                    <TokenValue amount={Number(pool.liquidity)} />
                  </div>
                  <div>
                    <strong>{t("minimum_wager")}:</strong>{" "}
                    <TokenValue amount={pool.minWager} />
                  </div>
                  <div>
                    <strong>{t("maximum_payout")}:</strong>{" "}
                    <TokenValue amount={pool.maxPayout} />
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <Button asChild>
                    <a
                      href={`https://explorer.gamba.so/pool/${pool.publicKey.toString()}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t("view_pool_on_explorer")}
                    </a>
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {pool.jackpotBalance > 0 && (
            <button
              onClick={() => setShowJackpotHelp(true)}
              className="hidden md:flex all-unset cursor-pointer text-[#003c00] rounded-lg bg-[#03ffa4] px-2.5 py-0.5 text-xs uppercase font-bold transition-colors duration-200 hover:bg-white"
            >
              <TokenValue amount={pool.jackpotBalance} />
            </button>
          )}
          {balance.bonusBalance > 0 && (
            <button
              onClick={() => setShowBonusHelp(true)}
              className="hidden md:flex all-unset cursor-pointer text-[#003c00] rounded-lg bg-[#03ffa4] px-2.5 py-0.5 text-xs uppercase font-bold transition-colors duration-200 hover:bg-white"
            >
              +<TokenValue amount={balance.bonusBalance} />
            </button>
          )}
          {connected ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <div className="flex items-center gap-2">
                    {token && (
                      <>
                        <img
                          className="w-5 h-5 rounded-full"
                          src={token.image || "/placeholder.svg"}
                          alt="Token"
                        />
                        <TokenValue amount={balance.balance} />
                        {balance.bonusBalance > 0 && (
                          <span className="text-xs">
                            +<TokenValue amount={balance.bonusBalance} />
                          </span>
                        )}
                      </>
                    )}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{t("wallet_settings_title")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {t("connected_wallet")}
                        </p>
                        <p className="text-xs opacity-70">
                          {truncateString(address || "", 8, 8)}
                        </p>
                      </div>
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src="/particle-logo.svg"
                          alt="Particle Network Logo"
                        />
                        <AvatarFallback>PN</AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t("balance")}</p>
                      <div className="flex items-center gap-2">
                        <img
                          className="w-8 h-8 rounded-full"
                          src={token.image || "/placeholder.svg"}
                          alt="Token"
                        />
                        <p className="text-2xl font-bold">
                          <TokenValue amount={balance.balance} />
                          {balance.bonusBalance > 0 && (
                            <span className="text-sm ml-1">
                              (+
                              <TokenValue amount={balance.bonusBalance} />{" "}
                              {t("bonus")})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <ScrollArea className="h-[200px] rounded-md border p-4">
                    <div className="space-y-2">
                      {Object.values(TOKENLIST).map((token, index) => (
                        <button
                          key={index}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg w-full text-left hover:bg-accent"
                          onClick={() => handleSetToken(token)}
                        >
                          <img
                            className="w-8 h-8 rounded-full"
                            src={token.image || "/placeholder.svg"}
                            alt={token.symbol}
                          />
                          <div>
                            <div>{token.symbol}</div>
                            <div className="text-sm opacity-50">
                              {token.name}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="space-y-4">
                    <p className="text-sm font-medium">{t("priority_fee")}</p>
                    <div className="flex items-center justify-between">
                      <span>{t("enable_priority_fee")}</span>
                      <Switch
                        checked={isPriorityFeeEnabled}
                        onCheckedChange={(checked) => {
                          set({ isPriorityFeeEnabled: checked });
                          if (checked) {
                            toast.success(t("priority_fee_enabled"));
                          } else {
                            toast.error(t("priority_fee_disabled"));
                          }
                        }}
                      />
                    </div>
                    {isPriorityFeeEnabled && (
                      <div className="space-y-2">
                        <label className="text-sm">
                          {t("priority_fee_microlamports")}:
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={newPriorityFee}
                            onChange={(e) => {
                              const parsedValue = Number.parseInt(
                                e.target.value,
                                10
                              );
                              if (!isNaN(parsedValue)) {
                                setNewPriorityFee(parsedValue);
                              }
                            }}
                          />
                          <Button onClick={handleSetPriorityFee}>
                            {t("set")}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm font-medium">{t("referral_link")}</p>
                    <div className="flex space-x-2">
                      <Input
                        value={`${window.location.origin}?ref=${address || ""}`}
                        readOnly
                      />
                      <Button onClick={copyInvite} variant="outline">
                        <ClipboardCopy className="h-4 w-4 mr-2" />
                        {t("copy")}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <DialogClose asChild>
                      <Link href="/profile" passHref legacyBehavior>
                        <Button variant="outline" className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          {t("view_profile")}
                        </Button>
                      </Link>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          // In a real implementation, we would use ConnectKit's disconnect function
                          window.location.reload();
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {t("disconnect")}
                      </Button>
                    </DialogClose>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <WalletConnectButton />
          )}
        </div>
      </div>
    </>
  );
}