// Declare missing modules
declare module "wagmi";
declare module "@tonconnect/ui-react";
declare module "@tanstack/react-query";
declare module "@wagmi/core";
declare module "@particle-network/auth-core-modal";
declare module "usehooks-ts";
declare module "next/navigation";

// Declare Telegram WebApp
interface Window {
  Telegram?: {
    WebApp: any;
  };
}
