import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useKafka } from "@/hooks/useKafka";
import { useUser } from "@/hooks/useUser";
import { useMessages } from "@/hooks/useMessages";
import {
  ChatMessage as KafkaChatMessage,
  DirectMessage,
  UserStatusMessage,
  FileContent,
} from "@/types/kafka";
import { ChatBox } from "@/components/chat/ChatBox";
import { MessageInput } from "@/components/chat/MessageInput";

const HomePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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

  useEffect(() => {
    const handleBeforeUnload = () => {
      window.kafka.shutdown();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [username]);

  const { isConnected, sendGlobalMessage, sendDirectMessage } = useKafka({
    onGlobalMessage: (message: KafkaChatMessage) => {
      handleGlobalMessage(message, username || "");
    },
    onDirectMessage: (message: DirectMessage) => {
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
    }
  }, [navigate, checkUsername, isConnected]);

  const handleSendFile = async (file: File) => {
    if (!isConnected || !file) return;

    const CHUNK_SIZE = 750 * 1024;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const fileId = `${Date.now()}-${file.name}`;

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
  };

  const handleSendMessage = async (message: string) => {
    if (message.trim() && isConnected) {
      currentRoom === "global"
        ? await sendGlobalMessage(message.trim(), "text")
        : await sendDirectMessage(currentRoom, message.trim(), "text");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <ChatBox messages={messages} />
      <MessageInput
        onSendMessage={handleSendMessage}
        onSendFile={handleSendFile}
        isConnected={isConnected}
      />
    </div>
  );
};

export default HomePage;
