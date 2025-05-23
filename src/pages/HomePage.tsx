import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaperclipIcon, SendIcon } from "lucide-react";
import { useState } from "react";
import { Message } from "@/types/message";

const HomePage = () => {
  // TODO: Implement Kafka integration
  // const { messages, loading, sendMessage } = useMessages();
  const [messages] = useState<Message[]>([
    {
      id: "1",
      text: "Hey there! How are you?",
      sender: "Alice",
      timestamp: "12:30 PM",
      isCurrentUser: false,
    },
    {
      id: "2",
      text: "I'm good, thanks! How about you?",
      sender: "You",
      timestamp: "12:31 PM",
      isCurrentUser: true,
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      // TODO: Implement Kafka message sending
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.isCurrentUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                message.isCurrentUser
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <div className="text-sm font-medium mb-1">{message.sender}</div>
              <div className="text-sm break-words">{message.text}</div>
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
              // Handle file attachment
              const input = document.createElement("input");
              input.type = "file";
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
            className="flex-1  text-black dark:text-white border-0 bg-slate-200 focus-visible:ring-blue-500"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
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
