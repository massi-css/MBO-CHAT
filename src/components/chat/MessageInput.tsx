import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaperclipIcon, SendIcon } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
  onSendFile: (file: File) => Promise<void>;
  isConnected: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSendFile,
  isConnected,
}) => {
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = async () => {
    if (newMessage.trim() && isConnected) {
      await onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onSendFile(file);
      }
    };
    input.click();
  };

  return (
    <div className="border-t bg-white p-4">
      <div className="flex gap-2 items-center max-w-4xl mx-auto">
        <Button size="icon" className="shrink-0" onClick={handleFileSelect}>
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
  );
};
