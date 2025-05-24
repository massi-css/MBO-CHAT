import { useState, useEffect, useCallback } from "react";
import {
  ChatMessage,
  DirectMessage,
  UserStatusMessage,
  FileContent,
} from "../types/kafka";
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
  const refreshActiveUsers = useCallback(
    async (newUser?: { username: string; consumerId: string }) => {
      try {
        const result = await window.kafka.getActiveUsers();
        console.log("Active users:", result.dmList);
        if (result.success) {
          const updatedUsers = new Map(result.dmList);
          // If there's a new user that just joined, make sure they're included
          // This handles the case where their consumer group isn't marked as stable yet
          if (newUser) {
            updatedUsers.set(newUser.username, newUser.consumerId);
          }
          setActiveUsers(updatedUsers);
        }
      } catch (error) {
        console.error("Failed to refresh active users:", error);
      }
    },
    []
  );

  // Handle incoming messages
  useEffect(() => {
    if (!isConnected) return;

    const cleanup = window.kafka.onMessage(({ topic, message }) => {
      switch (topic) {
        case TOPICS.USER_JOINED:
        case TOPICS.USER_LEFT:
          if (topic === TOPICS.USER_JOINED) {
            // For joins, include the new user immediately while fetching the full list
            refreshActiveUsers({
              username: message.username,
              consumerId: message.consumerId,
            });
            options.onUserJoined?.(message);
          } else {
            // For leaves, just fetch the updated list
            refreshActiveUsers();
            options.onUserLeft?.(message);
          }
          break;
        case TOPICS.GLOBAL:
          options.onGlobalMessage?.(message);
          break;
        case TOPICS.DM:
          if (username) {
            const dmMessage: DirectMessage = {
              from: message.from || message.username,
              to: message.to,
              content: message.content,
              type: message.type || "text",
              timestamp: message.timestamp,
            };
            if (dmMessage.to === username || dmMessage.from === username) {
              console.log("[useKafka] Processing DM for", username, dmMessage);
              options.onDirectMessage?.(dmMessage);
            }
          }
          break;
      }
    });

    return cleanup;
  }, [isConnected, options, username, refreshActiveUsers]);

  // Send message helper functions
  const sendGlobalMessage = useCallback(
    async (content: string | FileContent, type: "text" | "file" = "text") => {
      if (!username) return { success: false, error: "Not logged in" };

      return window.kafka.sendMessage(TOPICS.GLOBAL, {
        username,
        content,
        type,
        timestamp: Date.now(),
      });
    },
    [username]
  );

  const sendDirectMessage = useCallback(
    async (
      to: string,
      content: string | FileContent,
      type: "text" | "file" = "text"
    ) => {
      if (!username) return { success: false, error: "Not logged in" };

      return window.kafka.sendMessage(TOPICS.DM, {
        from: username,
        to,
        content,
        type,
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
