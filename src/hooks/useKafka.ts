import { useState, useEffect, useCallback } from "react";
import { ChatMessage, DirectMessage, UserStatusMessage } from "../types/kafka";
import { useUser } from "./useUser";
import { TOPICS } from "../shared/kafka-types";

interface UseKafkaOptions {
  onUserJoined?: (message: UserStatusMessage) => void;
  onUserLeft?: (message: UserStatusMessage) => void;
  onGlobalMessage?: (message: ChatMessage) => void;
  onDirectMessage?: (message: DirectMessage) => void;
}

export function useKafka(options: UseKafkaOptions = {}) {
  const [activeUsers, setActiveUsers] = useState<Map<string, string>>(
    new Map()
  );
  const { username, isConnected, connect } = useUser();

  // Handle incoming messages
  useEffect(() => {
    if (!isConnected) return;

    const cleanup = window.kafka.onMessage(({ topic, message }) => {
      switch (topic) {
        case TOPICS.USER_JOINED:
          setActiveUsers(new Map(message.dmList));
          options.onUserJoined?.(message);
          break;
        case TOPICS.USER_LEFT:
          setActiveUsers(new Map(message.dmList));
          options.onUserLeft?.(message);
          break;
        case TOPICS.GLOBAL:
          options.onGlobalMessage?.(message);
          break;
        case TOPICS.DM:
          if (message.to === username) {
            options.onDirectMessage?.(message);
          }
          break;
      }
    });

    return cleanup;
  }, [isConnected, options, username]);

  // Send message helper functions
  const sendGlobalMessage = useCallback(
    async (content: string) => {
      if (!username) return { success: false, error: "Not logged in" };

      return window.kafka.sendMessage(TOPICS.GLOBAL, {
        username,
        content,
        timestamp: Date.now(),
      });
    },
    [username]
  );

  const sendDirectMessage = useCallback(
    async (to: string, content: string) => {
      if (!username) return { success: false, error: "Not logged in" };

      return window.kafka.sendMessage(TOPICS.DM, {
        username,
        to,
        content,
        timestamp: Date.now(),
      });
    },
    [username]
  );

  return {
    isConnected,
    activeUsers,
    connect,
    sendGlobalMessage,
    sendDirectMessage,
  };
}
