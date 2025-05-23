import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaperclipIcon, SendIcon } from "lucide-react";
import { Message } from "@/types/message";
import { useKafka } from "@/hooks/useKafka";
import { useUser } from "@/hooks/useUser";
import { ChatMessage, DirectMessage, UserStatusMessage } from "@/types/kafka";

const HomePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { username, checkUsername } = useUser();
  const [currentRoom, setCurrentRoom] = useState(id || "global");
  const [messagesByRoom, setMessagesByRoom] = useState<Map<string, Message[]>>(
    new Map([["global", []]])
  );

  // Update current room when URL param changes
  useEffect(() => {
    if (id) {
      setCurrentRoom(id);
    }
  }, [id]);

  const { isConnected, connect, sendGlobalMessage, sendDirectMessage } =
    useKafka({
      onGlobalMessage: (message: ChatMessage) => {
        const newMsg: Message = {
          id: message.timestamp.toString(),
          text: message.content,
          sender: message.username,
          timestamp: new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isCurrentUser: message.username === username,
        };

        setMessagesByRoom((prev) => {
          const newMap = new Map(prev);
          const globalMessages = [...(prev.get("global") || []), newMsg];
          newMap.set("global", globalMessages);
          return newMap;
        });
      },
      onDirectMessage: (message: DirectMessage) => {
        const fromUser = message.from === username ? message.to : message.from;
        const newMsg: Message = {
          id: message.timestamp.toString(),
          text: message.content,
          sender: message.from,
          timestamp: new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isCurrentUser: message.from === username,
        };

        setMessagesByRoom((prev) => {
          const newMap = new Map(prev);
          const roomMessages = [...(prev.get(fromUser) || []), newMsg];
          newMap.set(fromUser, roomMessages);
          return newMap;
        });
      },
      onUserJoined: (message: UserStatusMessage) => {
        const systemMsg: Message = {
          id: Date.now().toString(),
          text: `${message.username} joined the chat`,
          sender: "System",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isCurrentUser: false,
          isSystemMessage: true,
        };

        setMessagesByRoom((prev) => {
          const newMap = new Map(prev);
          const globalMessages = [...(prev.get("global") || []), systemMsg];
          newMap.set("global", globalMessages);
          return newMap;
        });
      },
      onUserLeft: (message: UserStatusMessage) => {
        const systemMsg: Message = {
          id: Date.now().toString(),
          text: `${message.username} left the chat`,
          sender: "System",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isCurrentUser: false,
          isSystemMessage: true,
        };

        setMessagesByRoom((prev) => {
          const newMap = new Map(prev);
          const globalMessages = [...(prev.get("global") || []), systemMsg];
          newMap.set("global", globalMessages);
          return newMap;
        });
      },
    });
  // Navigate to login if not authenticated
  useEffect(() => {
    if (!checkUsername() && !isConnected) {
      navigate("/login");
      return;
    }
  }, [navigate, checkUsername, isConnected]);

  useEffect(() => {
    console.log("Current room changed to:", currentRoom);
    console.log("isconnected", isConnected);
  }, [currentRoom]);

  // Update messages when room changes or new messages arrive
  useEffect(() => {
    setMessages(messagesByRoom.get(currentRoom) || []);
  }, [currentRoom, messagesByRoom]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && isConnected) {
      const result =
        currentRoom === "global"
          ? await sendGlobalMessage(newMessage.trim())
          : await sendDirectMessage(currentRoom, newMessage.trim());

      if (result.success) {
        setNewMessage("");
      } else {
        console.error("Failed to send message:", result.error);
      }
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
