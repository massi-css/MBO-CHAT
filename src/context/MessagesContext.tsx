import { createContext } from "react";
import { Message } from "@/types/message";
import { ChatMessage, DirectMessage, UserStatusMessage } from "@/types/kafka";



interface MessagesContextType {
  messagesByRoom: Map<string, Message[]>;
  activeRooms: Set<string>;
  addMessage: (roomId: string, message: Message) => void;
  getMessages: (roomId: string) => Message[];
  initRoom: (roomId: string) => void;
  handleGlobalMessage: (message: ChatMessage, username: string) => void;
  handleDirectMessage: (message: DirectMessage, username: string) => void;
  handleUserStatusMessage: (
    message: UserStatusMessage,
    type: "joined" | "left"
  ) => void;
}

export const MessagesContext = createContext<MessagesContextType | undefined>(
  undefined
);
