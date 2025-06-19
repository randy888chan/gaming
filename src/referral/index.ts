// src/referral/index.ts
import { fetchReferral, getRefererPda } from "./program";

import Cookies from "js-cookie";
import { PublicKey } from "@solana/web3.js";

const PLATFORM_CREATOR_ADDRESS = new PublicKey(
  process.env.NEXT_PUBLIC_PLATFORM_CREATOR || PublicKey.default.toBase58(),
);

interface ReferralData {
  current: string | null;
  history: string[];
}

const MAX_HISTORY = 5;

// Mock D1 client for local development. In a Cloudflare Worker, `env.DB` would be the D1 binding.
const D1_MOCK = {
  prepare: (query: string) => ({
    bind: (params: any[]) => ({
      run: async () => {
        console.log(`Mock D1: Executing query: ${query} with params: ${params}`);
        return { success: true };
      },
    }),
  }),
};

export const rewardReferrer = async (referrerAddress: string, amount: number) => {
  console.log(`Simulating rewarding referrer ${referrerAddress} with ${amount} credits.`);
  // In a real system, this would involve updating the referrer's balance in D1.
  // For this mock, we'll simulate an update to user_preferences or a dedicated referral rewards table.
  await D1_MOCK.prepare(
    'UPDATE user_preferences SET referralCredits = referralCredits + ? WHERE walletAddress = ?'
  )
    .bind([amount, referrerAddress])
    .run();
  console.log(`Simulated reward for referrer ${referrerAddress} with ${amount} credits.`);
};

export const extractReferralAddress = (): PublicKey | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const referralCode = urlParams.get("code");
  if (!referralCode) return null;

  try {
    const publicKey = new PublicKey(referralCode);
    updateReferralData(referralCode);
    cleanUrlParams(urlParams);
    return publicKey;
  } catch (err) {
    console.error("Invalid referral address:", err);
    return null;
  }
};

export const fetchAndStoreReferral = async (
  anchorProvider: any,
  walletPublicKey: PublicKey | null,
) => {
  try {
    const pda = getRefererPda(
      PLATFORM_CREATOR_ADDRESS,
      walletPublicKey ?? PublicKey.default,
    );
    const referer = await fetchReferral(anchorProvider, pda);
    if (referer) {
      updateReferralData(referer.toString(), true);
    }
  } catch (err) {
    console.error("Referral", err);
  }
};

export const cleanUrlAndExtractReferral = () => {
  try {
    const address = extractReferralAddress();
    if (address) {
      updateReferralData(address.toString());
    }
  } catch (err) {
    console.error("Error extracting or cleaning referral address:", err);
  }
};

const cleanUrlParams = (urlParams: URLSearchParams) => {
  urlParams.delete("code");
  const newUrl = `${window.location.pathname}${
    urlParams.toString() ? "?" + urlParams.toString() : ""
  }${window.location.hash}`;
  window.history.replaceState({}, "", newUrl);
};

export const updateReferralData = (
  referralCode: string,
  onChain: boolean = false,
) => {
  const referralData: ReferralData = JSON.parse(
    Cookies.get("referralData") || '{"current":null,"history":[]}',
  );
  referralData.current = referralCode;
  referralData.history = [
    referralCode,
    ...referralData.history.filter((code) => code !== referralCode),
  ].slice(0, MAX_HISTORY);
  Cookies.set("referralData", JSON.stringify(referralData));
  if (onChain) {
    Cookies.set("referralAddressOnChain", referralCode);
  }
};

export const getReferralData = (): ReferralData => {
  return JSON.parse(
    Cookies.get("referralData") || '{"current":null,"history":[]}',
  );
};
