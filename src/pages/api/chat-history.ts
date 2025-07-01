import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server'; // Assuming Clerk for authentication

// In a real application, you would connect to a database
// and retrieve/store chat messages.
// For this example, we'll use a simple in-memory store.
interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: string;
}

const chatHistory: ChatMessage[] = []; // This will reset on server restart

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    // In a real app, filter by room/channel if applicable
    res.status(200).json(chatHistory);
  } else if (req.method === 'POST') {
    const { text, username } = req.body;

    if (!text || !username) {
      return res.status(400).json({ error: 'Message text and username are required' });
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: userId,
      username: username,
      text: text,
      timestamp: new Date().toISOString(),
    };

    chatHistory.push(newMessage);
    // In a real app, save to database here

    res.status(201).json(newMessage);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}