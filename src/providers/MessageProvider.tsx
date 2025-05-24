import { MessagesContext } from "@/context/MessagesContext";
import {
  ChatMessage,
  DirectMessage,
  UserStatusMessage,
  FileContent,
} from "@/types/kafka";
import { Message } from "@/types/message";
import { useCallback, useMemo, useState } from "react";

interface MessagesState {
  messagesByRoom: Map<string, Message[]>;
  activeRooms: Set<string>;
}
export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MessagesState>({
    messagesByRoom: new Map([["global", []]]),
    activeRooms: new Set(["global"]),
  });

  const addMessage = useCallback((roomId: string, message: Message) => {
    console.log(`[MessagesContext] Adding message to room ${roomId}:`, message);
    setState((prevState: MessagesState) => {
      const newMap = new Map(prevState.messagesByRoom);
      if (!newMap.has(roomId)) {
        console.log(`[MessagesContext] Initializing new room: ${roomId}`);
        newMap.set(roomId, []);
      }
      const roomMessages = [...(newMap.get(roomId) || []), message];
      newMap.set(roomId, roomMessages);

      const newActiveRooms = new Set(prevState.activeRooms);
      newActiveRooms.add(roomId);

      console.log(`[MessagesContext] Updated state for room ${roomId}:`, {
        messageCount: roomMessages.length,
        activeRooms: Array.from(newActiveRooms),
      });

      return {
        messagesByRoom: newMap,
        activeRooms: newActiveRooms,
      };
    });
  }, []);

  const getMessages = useCallback(
    (roomId: string) => {
      const messages = state.messagesByRoom.get(roomId) || [];
      console.log(`[MessagesContext] Getting messages for room ${roomId}:`, {
        messageCount: messages.length,
        firstMessage: messages[0]?.text,
        lastMessage: messages[messages.length - 1]?.text,
      });
      return messages;
    },
    [state.messagesByRoom]
  );

  const initRoom = useCallback((roomId: string) => {
    console.log(`[MessagesContext] Initializing room: ${roomId}`);
    setState((prevState: MessagesState) => {
      if (!prevState.messagesByRoom.has(roomId)) {
        const newMap = new Map(prevState.messagesByRoom);
        newMap.set(roomId, []);
        const newActiveRooms = new Set(prevState.activeRooms);
        newActiveRooms.add(roomId);
        console.log(`[MessagesContext] Created new room ${roomId}`, {
          activeRooms: Array.from(newActiveRooms),
        });
        return {
          messagesByRoom: newMap,
          activeRooms: newActiveRooms,
        };
      }
      console.log(`[MessagesContext] Room ${roomId} already exists`);
      return prevState;
    });
  }, []);

  const handleGlobalMessage = useCallback(
    (message: ChatMessage, username: string) => {
      console.log(`[MessagesContext] Handling global message:`, {
        from: message.username,
        content: message.content,
        type: message.type,
        timestamp: message.timestamp,
      });

      const newMsg: Message = {
        id: message.timestamp.toString(),
        text: typeof message.content === "string" ? message.content : "",
        sender: message.username,
        timestamp: new Date(message.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isCurrentUser: message.username === username,
        isSystemMessage: false,
        type: message.type || "text",
        fileContent:
          typeof message.content !== "string" ? message.content : undefined,
      };
      addMessage("global", newMsg);
    },
    [addMessage]
  );

  const handleDirectMessage = useCallback(
    (message: DirectMessage, username: string) => {
      console.log(`[MessagesContext] Handling direct message:`, {
        from: message.from,
        to: message.to,
        content: message.content,
        type: message.type,
        timestamp: message.timestamp,
      });

      // Determine the room ID based on the other user
      const roomId = message.from === username ? message.to : message.from;

      if (!roomId) {
        console.error(
          "[MessagesContext] Cannot determine room ID for DM:",
          message
        );
        return;
      }

      // Initialize the room if it doesn't exist
      initRoom(roomId);

      const newMsg: Message = {
        id: message.timestamp.toString(),
        text: typeof message.content === "string" ? message.content : "",
        sender: message.from,
        timestamp: new Date(message.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isCurrentUser: message.from === username,
        isSystemMessage: false,
        type: message.type || "text",
        fileContent:
          typeof message.content !== "string" ? message.content : undefined,
      };

      console.log("[MessagesContext] Adding DM to room:", {
        roomId,
        message: newMsg,
      });
      addMessage(roomId, newMsg);
    },
    [addMessage, initRoom]
  );

  const handleUserStatusMessage = useCallback(
    (message: UserStatusMessage, type: "joined" | "left") => {
      console.log(`[MessagesContext] Handling user ${type} message:`, {
        username: message.username,
        dmList: message.dmList,
      });
      const systemMsg: Message = {
        id: Date.now().toString(),
        text: `${message.username} ${type} the chat`,
        sender: "System",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isCurrentUser: false,
        isSystemMessage: true,
        type: "text",
      };
      addMessage("global", systemMsg);
    },
    [addMessage]
  );

  const contextValue = useMemo(
    () => ({
      messagesByRoom: state.messagesByRoom,
      activeRooms: state.activeRooms,
      addMessage,
      getMessages,
      initRoom,
      handleGlobalMessage,
      handleDirectMessage,
      handleUserStatusMessage,
    }),
    [
      state,
      addMessage,
      getMessages,
      initRoom,
      handleGlobalMessage,
      handleDirectMessage,
      handleUserStatusMessage,
    ]
  );

  return (
    <MessagesContext.Provider value={contextValue}>
      {children}
    </MessagesContext.Provider>
  );
}
