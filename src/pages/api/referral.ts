import type { NextApiRequest, NextApiResponse } from "next";

// Mock database for demonstration purposes
interface User {
  walletAddress: string;
  referralCode: string;
  referredBy?: string;
  balance: number;
}

interface Referral {
  referrerCode: string;
  referredWalletAddress: string;
  timestamp: number;
}

const mockUsers: User[] = [
  { walletAddress: "0xReferrer1", referralCode: "REFERRER1", balance: 100 },
  { walletAddress: "0xReferrer2", referralCode: "REFERRER2", balance: 50 },
];

const mockReferrals: Referral[] = [];

// Placeholder for database validation
async function validateReferralCode(code: string): Promise<User | undefined> {
  return mockUsers.find((user) => user.referralCode === code);
}

// Placeholder for storing referral relationship
async function storeReferralRelationship(
  referrerCode: string,
  referredWalletAddress: string
): Promise<void> {
  mockReferrals.push({
    referrerCode,
    referredWalletAddress,
    timestamp: Date.now(),
  });
  console.log(
    `Stored referral: ${referredWalletAddress} referred by ${referrerCode}`
  );
}

// Placeholder for reward distribution logic
async function distributeRewards(
  referrer: User,
  newUserWalletAddress: string
): Promise<void> {
  // Example: Give referrer 10 units and new user 5 units
  referrer.balance += 10;
  const newUser = mockUsers.find(
    (user) => user.walletAddress === newUserWalletAddress
  );
  if (newUser) {
    newUser.balance += 5;
  } else {
    // In a real app, you'd create the new user here or ensure they exist
    mockUsers.push({
      walletAddress: newUserWalletAddress,
      referralCode:
        "NEWUSER" + Math.random().toString(36).substring(7).toUpperCase(),
      referredBy: referrer.referralCode,
      balance: 5,
    });
  }
  console.log(
    `Rewards distributed: ${referrer.walletAddress} (new balance: ${
      referrer.balance
    }), ${newUserWalletAddress} (new balance: ${newUser?.balance || 5})`
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { referralCode, newUserWalletAddress } = req.body;

    if (!referralCode || !newUserWalletAddress) {
      return res
        .status(400)
        .json({ message: "Missing referralCode or newUserWalletAddress" });
    }

    const referrer = await validateReferralCode(referralCode);

    if (!referrer) {
      return res.status(404).json({ message: "Invalid referral code" });
    }

    // Check if the new user has already been referred
    const existingReferral = mockReferrals.find(
      (ref) => ref.referredWalletAddress === newUserWalletAddress
    );

    if (existingReferral) {
      return res
        .status(409)
        .json({ message: "User has already been referred" });
    }

    await storeReferralRelationship(referralCode, newUserWalletAddress);
    await distributeRewards(referrer, newUserWalletAddress);

    console.log(
      `Referral processed: User ${newUserWalletAddress} was referred by ${referralCode}`
    );

    res
      .status(200)
      .json({
        message: "Referral processed successfully",
        referrerBalance: referrer.balance,
      });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
