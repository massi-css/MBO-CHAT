import { useState, useEffect, useCallback } from "react";
import { useUser } from "./useUser";
import { useNavigate } from "react-router-dom";

export interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isCurrentUser: boolean;
}

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { username } = useUser();
  const navigate = useNavigate();

  // Subscribe to Kafka messages from the main process
  useEffect(() => {
    if (!username) {
      navigate("/login");
      return;
    }

    // Subscribe to messages from Kafka
    window.ipcRenderer.on("kafka:message", (_event, message: Message) => {
      setMessages((prev) => [
        ...prev,
        {
          ...message,
          isCurrentUser: message.sender === username,
        },
      ]);
    });

    // Load initial messages
    window.ipcRenderer
      .invoke("kafka:getMessages")
      .then((initialMessages: Message[]) => {
        setMessages(
          initialMessages.map((msg) => ({
            ...msg,
            isCurrentUser: msg.sender === username,
          }))
        );
        setLoading(false);
      });

    return () => {
      // Cleanup listeners when component unmounts
      window.ipcRenderer.removeAllListeners("kafka:message");
    };
  }, [username, navigate]);
  // Send a new message
  const sendMessage = useCallback(
    async (text: string) => {
      if (!username || !text.trim()) return;

      const newMessage: Message = {
        id: Date.now().toString(),
        text: text.trim(),
        sender: username,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isCurrentUser: true,
      };

      try {
        // Send message to Kafka through main process
        await window.ipcRenderer.invoke("kafka:sendMessage", newMessage);
        return newMessage;
      } catch (error) {
        console.error("Failed to send message:", error);
        return null;
      }
    },
    [username]
  );

  return {
    messages,
    loading,
    sendMessage,
  };
};
