import React from "react";
import { Message } from "@/types/message";
import { FileMessage } from "./FileMessage";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div
      className={`flex w-full ${
        message.isSystemMessage
          ? "justify-center"
          : message.isCurrentUser
          ? "justify-end"
          : "justify-start"
      } mb-4`}
    >
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 overflow-hidden ${
          message.isSystemMessage
            ? "bg-gray-200 text-gray-600 text-center"
            : message.isCurrentUser
            ? "bg-primary text-white"
            : "bg-gray-100 text-gray-900"
        }`}
      >
        {!message.isSystemMessage && (
          <div className="text-sm font-medium mb-1 break-words">
            {message.sender}
          </div>
        )}
        {message.type === "file" && message.fileContent ? (
          <FileMessage
            fileContent={message.fileContent}
            isCurrentUser={message.isCurrentUser}
          />
        ) : (
          <div className="text-sm break-all whitespace-pre-wrap overflow-wrap-anywhere">
            {message.text}
          </div>
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
