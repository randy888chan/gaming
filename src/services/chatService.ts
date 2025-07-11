import { io, Socket } from "socket.io-client";

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: string;
}

let socket: Socket | null = null;
let messageListeners: ((message: ChatMessage) => void)[] = [];

export const connectChat = (token: string) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(
    process.env.NEXT_PUBLIC_CHAT_SERVER_URL || "http://localhost:3001",
    {
      auth: {
        token: token,
      },
    }
  );

  socket.on("connect", () => {
    console.log("Connected to chat server");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from chat server");
  });

  socket.on("chatMessage", (message: ChatMessage) => {
    console.log("Received message:", message);
    messageListeners.forEach((listener) => listener(message));
  });

  socket.on("connect_error", (err) => {
    console.error("Chat connection error:", err.message);
  });
};

export const disconnectChat = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const sendChatMessage = (
  message: Omit<ChatMessage, "id" | "timestamp">
) => {
  if (socket && socket.connected) {
    socket.emit("chatMessage", message);
  } else {
    console.warn("Socket not connected. Message not sent:", message);
  }
};

export const onChatMessage = (listener: (message: ChatMessage) => void) => {
  messageListeners.push(listener);
  return () => {
    messageListeners = messageListeners.filter((l) => l !== listener);
  };
};

export const getSocket = () => socket;
