import type { NextApiRequest, NextApiResponse } from 'next';
import { AIServiceAdapter } from '../../services/aiAdapter';

type Data = {
  suggestion?: {
    amount: number;
    multiplier: number;
    confidence: number;
  };
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { gameId, userAddress, riskProfile } = req.body;

  if (!gameId || !userAddress || !riskProfile) {
    return res.status(400).json({ error: 'gameId, userAddress, and riskProfile are required' });
  }

  // Mock D1 client for local development. In a Cloudflare Worker, `env.DB` would be the D1 binding.
  const D1 = {
    prepare: (query: string) => ({
      bind: (params: any[]) => ({
        first: async (column?: string) => {
          // Simulate D1 query for user preferences
          if (query.includes('SELECT riskTolerance, preferredGames FROM user_preferences WHERE walletAddress = ?')) {
            // For demonstration, return mock preferences based on userAddress
            if (params[0] === 'user_conservative') {
              return { riskTolerance: 'conservative', preferredGames: '["dice"]' };
            } else if (params[0] === 'user_aggressive') {
              return { riskTolerance: 'aggressive', preferredGames: '["slots"]' };
            }
            return null;
          }
          return null;
        },
      }),
    }),
  };

  const aiAdapter = new AIServiceAdapter();

  try {
    // Fetch user preferences from D1 (simulated)
    const userPreferences = await D1.prepare(
      'SELECT riskTolerance, preferredGames FROM user_preferences WHERE walletAddress = ?'
    )
      .bind([userAddress])
      .first();

    const actualRiskProfile = userPreferences?.riskTolerance || riskProfile;
    const preferredGames = userPreferences?.preferredGames ? JSON.parse(userPreferences.preferredGames) : [];

    // Construct AI prompt
    const prompt = `Suggest a smart bet for game "${gameId}" for user "${userAddress}" with risk profile "${actualRiskProfile}". Preferred games: ${preferredGames.join(', ')}. Provide response in JSON format: {"amount": number, "multiplier": number, "confidence": number}`;

    const aiResponse = await aiAdapter.generate({
      provider: 'mistral',
      type: 'text',
      prompt: prompt,
    });

    if (!aiResponse.success || !aiResponse.content) {
      return res.status(500).json({ error: aiResponse.error || 'Failed to get AI suggestion' });
    }

    // Parse AI response. The AI is expected to return a JSON string.
    let suggestion;
    try {
      suggestion = JSON.parse(aiResponse.content);
    } catch (parseError: any) {
      console.error('Failed to parse AI response:', aiResponse.content, parseError);
      return res.status(500).json({ error: 'Invalid AI response format.' });
    }

    res.status(200).json({ suggestion });
  } catch (error: any) {
    console.error('Error in smart-bet API:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}