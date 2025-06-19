import type { NextApiRequest, NextApiResponse } from 'next';

interface SocialPosterPayload {
  contentId: string;
  platforms: ('twitter' | 'facebook')[];
  scheduleAt: string; // ISO 8601 string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { contentId, platforms, scheduleAt }: SocialPosterPayload = req.body;

    if (!contentId || !platforms || !scheduleAt) {
      return res.status(400).json({ success: false, error: 'Missing required fields.' });
    }

    console.log(`Received social post request for contentId: ${contentId}`);
    console.log(`Platforms: ${platforms.join(', ')}`);
    console.log(`Scheduled At: ${scheduleAt}`);

    // In a real application, you would:
    // 1. Fetch content from D1 using contentId
    // 2. Use external APIs (e.g., Twitter API v2, Facebook Graph API) to post content
    // 3. Handle scheduling if 'scheduleAt' is in the future (e.g., with a cron job or message queue)

    // Simulate successful posting
    const postedTo: string[] = [];
    if (platforms.includes('twitter')) {
      console.log(`Simulating post to Twitter for contentId: ${contentId}`);
      postedTo.push('twitter');
    }
    if (platforms.includes('facebook')) {
      console.log(`Simulating post to Facebook for contentId: ${contentId}`);
      postedTo.push('facebook');
    }

    return res.status(200).json({ success: true, postedTo });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}