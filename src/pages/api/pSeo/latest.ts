// src/pages/api/pSeo/latest.ts
import type { NextApiRequest, NextApiResponse } from "next";

// This is a placeholder for a real caching mechanism.
// In a production environment, you would use a database or a dedicated caching service (e.g., Redis).
let cachedPSeoContent: any = null;
let lastGeneratedTime: number = 0;

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export async function getLatestPSeoContent() {
  // In a real scenario, this would fetch the latest generated pSEO content from a database
  // or a storage solution where the pSEO generator worker saves its output.
  // For demonstration, we'll return dummy content.
  if (cachedPSeoContent && Date.now() - lastGeneratedTime < CACHE_DURATION) {
    console.log("Serving pSEO content from cache.");
    return cachedPSeoContent;
  }

  console.log("Generating new pSEO content (simulated).");
  const newContent = {
    title: "Discover the Best Online Gaming Experience",
    description:
      "Explore a wide variety of thrilling online games, from classic casino games to innovative new experiences. Play responsibly and win big!",
    keywords: [
      "online gaming",
      "casino games",
      "play to earn",
      "crypto games",
      "gambling online",
    ],
    content: `
      <p>Welcome to the ultimate destination for online gaming enthusiasts! Our platform offers an unparalleled selection of games designed to provide endless entertainment and opportunities to win. Whether you're a fan of classic casino staples like Roulette and Blackjack, or you prefer the fast-paced action of Crash and Limbo, we have something for everyone.</p>
      <p>We are committed to providing a fair and secure gaming environment. Our provably fair system ensures that every game outcome is transparent and verifiable, giving you peace of mind with every play. Join our growing community of players and experience the future of online gaming today!</p>
      <p>Stay tuned for daily updates and new game releases. Our pSEO system constantly analyzes market trends and player preferences to bring you the most relevant and exciting content. Get ready to elevate your gaming experience!</p>
    `,
  };

  cachedPSeoContent = newContent;
  lastGeneratedTime = Date.now();
  return newContent;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const content = await getLatestPSeoContent();
      res.status(200).json(content);
    } catch (error) {
      console.error("Error fetching latest pSEO content:", error);
      res.status(500).json({ message: "Failed to fetch latest pSEO content." });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
