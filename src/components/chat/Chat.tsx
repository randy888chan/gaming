import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  connectChat,
  disconnectChat,
  sendChatMessage,
  onChatMessage,
} from "@/services/chatService";
import { useUserStore } from "@/hooks/useUserStore";

interface Message {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (!user?.walletAddress) return;

    // Assuming user.walletAddress can be used as a unique ID for chat authentication
    // In a real app, you'd likely use a proper JWT or session token
    connectChat(user.walletAddress);

    const unsubscribe = onChatMessage((message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      disconnectChat();
      unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    // Fetch message history on component mount
    const fetchChatHistory = async () => {
      try {
        const response = await fetch("/api/chat-history");
        if (response.ok) {
          const history = await response.json();
          setMessages(history);
        } else {
          console.error("Failed to fetch chat history:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    fetchChatHistory();
  }, []); // Empty dependency array means this runs once on mount

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !user) return;

    const message = {
      userId: user.walletAddress,
      username: user.username || "Anonymous",
      text: newMessage,
    };

    // Send message via WebSocket
    sendChatMessage(message);

    // Also persist to history via API
    try {
      await fetch("/api/chat-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error("Error persisting message:", error);
    }

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg p-4">
      <ScrollArea className="flex-1 mb-4 pr-2" ref={scrollAreaRef}>
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <span className="font-bold text-blue-400">{msg.username}: </span>
            <span className="text-white">{msg.text}</span>
            <span className="text-gray-500 text-xs ml-2">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </ScrollArea>
      <div className="flex">
        <Input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
          className="flex-1 mr-2 bg-gray-700 border-gray-600 text-white"
          disabled={!user}
        />
        <Button
          onClick={handleSendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!user}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
