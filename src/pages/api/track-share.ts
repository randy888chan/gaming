import type { NextApiRequest, NextApiResponse } from "next";

interface TrackSharePayload {
  contentId: string;
  eventType: "impression" | "click";
  userId?: string; // Optional, if a logged-in user is sharing
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { contentId, eventType, userId }: TrackSharePayload = req.body;

    if (!contentId || !eventType) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields." });
    }

    console.log(
      `Received track share request for contentId: ${contentId}, eventType: ${eventType}`
    );
    if (userId) {
      console.log(`User ID: ${userId}`);
    }

    // In a real application, you would:
    // 1. Connect to Cloudflare D1
    // 2. Update the 'content_metadata' table based on contentId and eventType
    //    - Increment 'impressions' for 'impression' events
    //    - Increment 'clicks' for 'click' events
    // 3. Potentially log the event for analytics
    // 4. If userId is present and this is a referral/incentive-driven share,
    //    trigger logic in the referral system (e.g., src/referral/index.ts)

    console.log(
      `Simulating database update for content_metadata (contentId: ${contentId}, eventType: ${eventType})`
    );

    return res
      .status(200)
      .json({
        success: true,
        message: `Tracked ${eventType} for ${contentId}`,
      });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
