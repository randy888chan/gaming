// config.ts

import { PublicKey } from "@solana/web3.js";
import { useTokenMeta } from "gamba-react-ui-v2";

// Solana address you wish to receive fees
export const PLATFORM_CREATOR_ADDRESS = new PublicKey(
  "FWDfscAynsxLRwyxJDtof3nxbSjcAHrT96QZxZDwVvmx",
);

// Platform URL - Appears in ShareModal
export const PLATFORM_SHARABLE_URL = "";

// Toggle all live events acrossed gamba toast
export const LIVE_EVENT_TOAST = true;

// RPC - Can be configured in .env
export const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_RPC_ENDPOINT ?? "https://api.mainnet-beta.solana.com";

// Platform explorer URL - Appears in welcome banner
export const PLATFORM_EXPLORER_URL = `https://explorer.gamba.so/platform/${PLATFORM_CREATOR_ADDRESS.toString()}`;

// List of tokens supported by this platform
export const TOKENS = [
  // SOL:
  {
    mint: new PublicKey("So11111111111111111111111111111111111111112"),
    symbol: "SOL",
    name: "SOL",
    image:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    decimals: 9,
    baseWager: 0.01e9,
  },
  // USDC:
  {
    mint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    symbol: "USDC",
    name: "USDC",
    image:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAM1BMVEUAAAAgcM8oeMcndckndcondco1fs1ChtFQj9RdmNdroNt4qd6TuuW81O/X5vXl7vn///9JjkDLAAAABXRSTlMAECDg8En8Fj4AAAFcSURBVFjDvZfRQsMgDEXp2minzuX/v9YXnaXJvbktzjw1QA6BQkhagzLbQ5Z2VCyRQXMdMRuR5fzsohcmyKg9IZgso/Y5YT/mfausLyWh73d3Z3okBPMI2CEw4OYI4J8QEMe6JU51rdw+bjwl0MXCPsU+ahlhxvMnakIofh9ZRQqgB2o3ZKrsDfzP3oXCX7oq5oBvhbnAdxwQMkDmwO/nFbiwA4B5SNfmFPWjriLAHg689aM+8JUwd/dbANQxCKxBPLRnATlFAsCDJAN6xCmA2Vpfh1bv+n0UEO/5YcCNARYcPyUNXaZOI6G6MYB2G8V44HU82M2zyhGpsZ9VxUQxKhuNytiF+l24jL5M30/bggnpquLzfPZ1ThIEFshC74QzDMfmXiVJKBA6tS/TtJ+2VyVPNAw4lqrSBiVZJqqWrj+zYHhWyfMHRZeAmAYLR6l2nZD15d+K7wjBo74A10JdTYrgUpYAAAAASUVORK5CYII=",
    decimals: 6,
    baseWager: 1e6,
  },
  //SOCA:
  {
    mint: new PublicKey("6uihwkp7FPREQPuGrqdcGxm4YkN7h3Ykq1b69pktoCzb"),
    symbol: "SOCA",
    name: "Socasino",
    image:
      "https://bafkreigzwsyjndiusmywapiyuedrpve7sraoxrohkgxcfwpvcvtgtmalea.ipfs.nftstorage.link/",
    decimals: 6,
    baseWager: 1000000e6,
  },
  // TSTCOIN:
  // {
  //   mint: new PublicKey("8CofuxeTuXjrZSMahW9wYkedVoNcvwua6aJeM1UhxuLh"),
  //   symbol: "TSTCOIN",
  //   name: "TESTERCOIN",
  //   image: "https://i.ibb.co/SvfbhLy/imageedit-37-6175591894.png",
  //   decimals: 9,
  //   baseWager: 1e9,
  // },
];

// handler for TOKENS
useTokenMeta.setFallbackHandler((mint) => {
  // SOL
  if (
    mint.equals(new PublicKey("So11111111111111111111111111111111111111112"))
  ) {
    return {
      mint: new PublicKey("So11111111111111111111111111111111111111112"),
      symbol: "SOL",
      name: "SOL",
      image:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
      decimals: 9,
      baseWager: 1 * 0.01e9,
    };
  }

  // USDC
  if (
    mint.equals(new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"))
  ) {
    return {
      mint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
      symbol: "USDC",
      name: "USDC",
      image:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAM1BMVEUAAAAgcM8oeMcndckndcondco1fs1ChtFQj9RdmNdroNt4qd6TuuW81O/X5vXl7vn///9JjkDLAAAABXRSTlMAECDg8En8Fj4AAAFcSURBVFjDvZfRQsMgDEXp2minzuX/v9YXnaXJvbktzjw1QA6BQkhagzLbQ5Z2VCyRQXMdMRuR5fzsohcmyKg9IZgso/Y5YT/mfausLyWh73d3Z3okBPMI2CEw4OYI4J8QEMe6JU51rdw+bjwl0MXCPsU+ahlhxvMnakIofh9ZRQqgB2o3ZKrsDfzP3oXCX7oq5oBvhbnAdxwQMkDmwO/nFbiwA4B5SNfmFPWjriLAHg689aM+8JUwd/dbANQxCKxBPLRnATlFAsCDJAN6xCmA2Vpfh1bv+n0UEO/5YcCNARYcPyUNXaZOI6G6MYB2G8V44HU82M2zyhGpsZ9VxUQxKhuNytiF+l24jL5M30/bggnpquLzfPZ1ThIEFshC74QzDMfmXiVJKBA6tS/TtJ+2VyVPNAw4lqrSBiVZJqqWrj+zYHhWyfMHRZeAmAYLR6l2nZD15d+K7wjBo74A10JdTYrgUpYAAAAASUVORK5CYII=",
      decimals: 6,
      baseWager: 1 * 1e6,
    };
  }

  // SOCA
  if (
    mint.equals(new PublicKey("6uihwkp7FPREQPuGrqdcGxm4YkN7h3Ykq1b69pktoCzb"))
  ) {
    return {
      mint: new PublicKey("6uihwkp7FPREQPuGrqdcGxm4YkN7h3Ykq1b69pktoCzb"),
      symbol: "SOCA",
      name: "Socasino",
      image:
        "https://bafkreigzwsyjndiusmywapiyuedrpve7sraoxrohkgxcfwpvcvtgtmalea.ipfs.nftstorage.link/",
      decimals: 6,
      baseWager: 1000000 * 1e6,
    };
  }

  // TSTCOIN
  if (
    mint.equals(new PublicKey("8CofuxeTuXjrZSMahW9wYkedVoNcvwua6aJeM1UhxuLh"))
  ) {
    return {
      mint: new PublicKey("8CofuxeTuXjrZSMahW9wYkedVoNcvwua6aJeM1UhxuLh"),
      symbol: "TSTCOIN",
      name: "TESTERCOIN",
      image: "https://i.ibb.co/SvfbhLy/imageedit-37-6175591894.png",
      decimals: 9,
      baseWager: 1 * 1e9,
    };
  }

  return undefined;
});
