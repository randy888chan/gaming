import type { NextApiRequest, NextApiResponse } from 'next';
import { getReferralData, rewardReferrer } from '../../referral'; // Adjust path as needed

type Data = {
  success: boolean;
  creditAmount?: number;
  error?: string;
};

// Define a type for the decoded JWT payload
interface JwtPayload {
  walletAddress: string;
  // Add other properties if your JWT contains them
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { userToken } = req.body;

  if (!userToken) {
    return res.status(400).json({ success: false, error: 'userToken is required' });
  }

  // In a real Cloudflare Worker environment, you would interact with D1 here.
  // For this Next.js API route, we'll simulate the D1 interaction.

  // Mock D1 client for local development. In a Cloudflare Worker, `env.DB` would be the D1 binding.
  const D1 = {
    prepare: (query: string) => ({
      bind: (params: any[]) => ({
        first: async (column?: string) => {
          // Simulate D1 query for user existence
          if (query.includes('SELECT walletAddress FROM user_preferences WHERE walletAddress = ?')) {
            // For demonstration, assume user does not exist unless a specific token is provided
            return params[0] === 'existing_user_token' ? { walletAddress: params[0], hasClaimedFirstPlay: true } : null;
          } else if (query.includes('SELECT hasClaimedFirstPlay FROM user_preferences WHERE walletAddress = ?')) {
            // Simulate D1 query for hasClaimedFirstPlay status
            return params[0] === 'new_user_token' ? { hasClaimedFirstPlay: false } : { hasClaimedFirstPlay: true };
          }
          return null;
        },
        run: async () => {
          // Simulate D1 insert/update operation
          if (query.includes('INSERT INTO user_preferences') || query.includes('UPDATE user_preferences')) {
            console.log(`Mock D1: Operation successful for walletAddress: ${params[0]}`);
            return { success: true };
          }
          return { success: false };
        },
      }),
    }),
  };

  // Helper to extract wallet address from userToken (which is publicAddress from Particle Network)
  const getWalletAddressFromUserToken = async (userToken: string): Promise<string> => {
    // In a real Cloudflare Worker, you would perform server-to-server validation with Particle Network here
    // For this mock, we assume userToken is the walletAddress
    return userToken;
  };

  try {
    const walletAddress = await getWalletAddressFromUserToken(userToken);

    // Check if user exists and if they have already claimed the first play
    const userStatus = await D1.prepare(
      'SELECT hasClaimedFirstPlay FROM user_preferences WHERE walletAddress = ?'
    )
      .bind([walletAddress])
      .first();

    if (userStatus?.hasClaimedFirstPlay) {
      return res.status(200).json({ success: false, error: 'First play free already claimed' });
    }

    if (!userStatus || userStatus.hasClaimedFirstPlay === undefined) {
      // User does not exist or hasClaimedFirstPlay is not set, create record and grant first play free
      await D1.prepare(
        'INSERT INTO user_preferences (walletAddress, lastLogin, hasClaimedFirstPlay, riskTolerance, preferredGames, notificationSettings) VALUES (?, CURRENT_TIMESTAMP, TRUE, ?, ?, ?)'
      )
        .bind([walletAddress, 'medium', '[]', '{}']) // Default values for new user
        .run();
      console.log(`New user record created and first play claimed for walletAddress: ${walletAddress}`);

      // Check for referral and reward referrer
      const referralData = getReferralData();
      if (referralData.current) {
        await rewardReferrer(referralData.current, 0.0005); // Example reward amount
      }
    } else {
      // User exists but hasn't claimed first play, update record
      await D1.prepare(
        'UPDATE user_preferences SET hasClaimedFirstPlay = TRUE WHERE walletAddress = ?'
      )
        .bind([walletAddress])
        .run();
      console.log(`Existing user ${walletAddress} claimed first play.`);
    }

    const creditAmount = 0.001; // SOL as per architecture

    res.status(200).json({ success: true, creditAmount });
  } catch (error: any) {
    console.error('Error in first-play-free API:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
}