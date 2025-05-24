import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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
    if (!checkUsername() || !isConnected) {
      navigate("/login");
      return;
    }
  }, [navigate, checkUsername, isConnected]);

  const handleSendFile = async (file: File) => {
    if (!isConnected || !file) return;

    const CHUNK_SIZE = 750 * 1024; // 750KB chunks to stay safely under Kafka limits
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const fileId = `${Date.now()}-${file.name}`; // Unique ID for this file transfer

    const sendChunk = async (chunk: ArrayBuffer, index: number) => {
      const base64Data = btoa(
        new Uint8Array(chunk).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      const fileContent: FileContent = {
        filename: file.name,
        data: base64Data,
        mimeType: file.type,
        fileId,
        chunkIndex: index,
        totalChunks,
        isChunked: true,
      };

      console.log(
        `[HomePage] Sending chunk ${index + 1}/${totalChunks} for ${file.name}`
      );

      const result =
        currentRoom === "global"
          ? await sendGlobalMessage(fileContent, "file")
          : await sendDirectMessage(currentRoom, fileContent, "file");

      return result;
    };

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const chunkArrayBuffer = await new Promise<ArrayBuffer>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
        reader.readAsArrayBuffer(chunk);
      });

      const result = await sendChunk(chunkArrayBuffer, i);

      if (!result.success) {
        console.error(
          `[HomePage] Failed to send chunk ${i + 1}/${totalChunks}:`,
          result.error
        );
        return;
      }
    }

    console.log(`[HomePage] Successfully sent all chunks for ${file.name}`);
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
      const { mimeType, data, filename, isChunked, fileId } =
        message.fileContent;

      // Don't render incomplete chunked files being received
      if (isChunked) {
        return (
          <div className="text-sm italic">
            {message.isCurrentUser ? "Sending" : "Receiving"} {filename}...
          </div>
        );
      }

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
      if (mimeType.startsWith("video/")) {
        return (
          <video
            controls
            className="max-w-full rounded-lg"
            style={{ maxHeight: "300px" }}
          >
            <source src={`data:${mimeType};base64,${data}`} type={mimeType} />
            Your browser does not support the video tag.
          </video>
        );
      }
      // For other file types, show a download link
      return (
        <div className="flex items-center gap-2">
          <PaperclipIcon className="h-4 w-4" />
          <a
            href={`data:${mimeType};base64,${data}`}
            download={filename}
            className={`${
              message.isCurrentUser ? "text-white" : "text-blue-500"
            } hover:underline`}
          >
            {filename}
          </a>
        </div>
      );
    }
    // Regular text message
    return <div className="text-sm break-words">{message.text}</div>;
  };

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesEndRef]);

  // Scroll to bottom on new message
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-blue-500 [&::-webkit-scrollbar-thumb]:rounded-full">
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
        <div ref={messagesEndRef} /> {/* Anchor element for auto-scroll */}
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
