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
      } mb-4 hover:opacity-95 transition-opacity`}
    >
      <div
        className={`max-w-[70%] rounded-2xl px-5 py-3 overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
          message.isSystemMessage
            ? "bg-gray-100/80 text-gray-600 text-center backdrop-blur-sm"
            : message.isCurrentUser
            ? "bg-primary text-white shadow-blue-100"
            : "bg-slate-100 text-gray-900 shadow-gray-100 border border-gray-100"
        }`}
      >
        {!message.isSystemMessage && (
          <div className="text-sm font-semibold mb-1.5 break-words tracking-tight">
            {message.sender}
          </div>
        )}
        {message.type === "file" && message.fileContent ? (
          <FileMessage
            fileContent={message.fileContent}
            isCurrentUser={message.isCurrentUser}
          />
        ) : (
          <div className="text-[0.9375rem] break-words whitespace-pre-wrap leading-relaxed">
            {message.text}
          </div>
        )}
        <div
          className={`text-[0.6875rem] mt-1.5 opacity-80 ${
            message.isCurrentUser ? "text-blue-50" : "text-gray-500"
          }`}
        >
          {message.timestamp}
        </div>
      </div>
    </div>
  );
};
