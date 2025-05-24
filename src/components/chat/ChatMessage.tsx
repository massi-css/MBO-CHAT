import React from "react";
import { Message } from "@/types/message";
import { FileMessage } from "./FileMessage";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div
      className={`flex ${
        message.isSystemMessage
          ? "justify-center"
          : message.isCurrentUser
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          message.isSystemMessage
            ? "bg-gray-200 text-gray-600 text-center"
            : message.isCurrentUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-900"
        }`}
      >
        {!message.isSystemMessage && (
          <div className="text-sm font-medium mb-1">{message.sender}</div>
        )}
        {message.type === "file" && message.fileContent ? (
          <FileMessage
            fileContent={message.fileContent}
            isCurrentUser={message.isCurrentUser}
          />
        ) : (
          <div className="text-sm break-words">{message.text}</div>
        )}
        <div
          className={`text-xs mt-1 ${
            message.isCurrentUser ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {message.timestamp}
        </div>
      </div>
    </div>
  );
};
