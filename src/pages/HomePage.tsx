import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaperclipIcon, SendIcon } from "lucide-react";
import { Message } from "@/types/message";
import { useKafka } from "@/hooks/useKafka";
import { useUser } from "@/hooks/useUser";
import { useMessages } from "@/hooks/useMessages";
import {
  ChatMessage,
  DirectMessage,
  UserStatusMessage,
  FileContent,
} from "@/types/kafka";

const HomePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [newMessage, setNewMessage] = useState("");
  const { username, checkUsername } = useUser();
  const [currentRoom, setCurrentRoom] = useState(id || "global");
  const {
    getMessages,
    initRoom,
    handleGlobalMessage,
    handleDirectMessage,
    handleUserStatusMessage,
  } = useMessages();

  const messages = useMemo(
    () => getMessages(currentRoom),
    [currentRoom, getMessages]
  );

  useEffect(() => {
    if (id) {
      setCurrentRoom(id);
      initRoom(id);
    } else {
      setCurrentRoom("global");
      initRoom("global");
    }
  }, [id, initRoom]);

  const { isConnected, sendGlobalMessage, sendDirectMessage } = useKafka({
    onGlobalMessage: (message: ChatMessage) => {
      handleGlobalMessage(message, username || "");
    },
    onDirectMessage: (message: DirectMessage) => {
      console.log("[HomePage] Received DM:", message);
      if (username) {
        handleDirectMessage(message, username);
      }
    },
    onUserJoined: (message: UserStatusMessage) => {
      handleUserStatusMessage(message, "joined");
    },
    onUserLeft: (message: UserStatusMessage) => {
      handleUserStatusMessage(message, "left");
    },
  });

  useEffect(() => {
    if (!checkUsername() && !isConnected) {
      navigate("/login");
      return;
    }
  }, [navigate, checkUsername, isConnected]);

  const handleSendFile = async (file: File) => {
    if (!isConnected || !file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = (e.target?.result as string)?.split(",")[1];
      if (!base64Data) return;

      const fileContent: FileContent = {
        filename: file.name,
        data: base64Data,
        mimeType: file.type,
      };

      console.log("[HomePage] Sending file:", {
        currentRoom,
        filename: file.name,
        isGlobal: currentRoom === "global",
      });

      const result =
        currentRoom === "global"
          ? await sendGlobalMessage(fileContent, "file")
          : await sendDirectMessage(currentRoom, fileContent, "file");

      console.log("[HomePage] Send file result:", result);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && isConnected) {
      console.log("[HomePage] Sending message:", {
        currentRoom,
        message: newMessage.trim(),
        isGlobal: currentRoom === "global",
      });

      const result =
        currentRoom === "global"
          ? await sendGlobalMessage(newMessage.trim(), "text")
          : await sendDirectMessage(currentRoom, newMessage.trim(), "text");

      console.log("[HomePage] Send result:", result);

      if (result.success) {
        setNewMessage("");
      } else {
        console.error("[HomePage] Failed to send message:", result.error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message: Message) => {
    if (message.type === "file" && message.fileContent) {
      const { mimeType, data, filename } = message.fileContent;
      if (mimeType.startsWith("image/")) {
        return (
          <img
            src={`data:${mimeType};base64,${data}`}
            alt={filename}
            className="max-w-full rounded-lg"
            style={{ maxHeight: "200px" }}
          />
        );
      }
      // For other file types, show a download link
      return (
        <div className="flex items-center gap-2">
          <PaperclipIcon className="h-4 w-4" />
          <a
            href={`data:${mimeType};base64,${data}`}
            download={filename}
            className="text-blue-500 hover:underline"
          >
            {filename}
          </a>
        </div>
      );
    }
    // Regular text message
    return <div className="text-sm break-words">{message.text}</div>;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
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
              {renderMessage(message)}
              <div
                className={`text-xs mt-1 ${
                  message.isCurrentUser ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {message.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-2 items-center max-w-4xl mx-auto">
          <Button
            size="icon"
            className="shrink-0"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  handleSendFile(file);
                }
              };
              input.click();
            }}
          >
            <PaperclipIcon className="h-5 w-5" />
            <span className="sr-only">Attach file</span>
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 text-black dark:text-white border-0 bg-slate-200 focus-visible:ring-blue-500"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="shrink-0"
          >
            <SendIcon className="h-5 w-5" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
