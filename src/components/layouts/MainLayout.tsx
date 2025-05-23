import { ReactNode, useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/layouts/Sidebar";
import Navbar from "@/components/layouts/Navbar";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";
import { useKafka } from "@/hooks/useKafka";
import { UserStatusMessage, DirectMessage } from "@/types/kafka";

interface MainLayoutProps {
  children?: ReactNode;
}

interface DirectMessageItem {
  id: string;
  username: string;
  lastMessage: string;
  timestamp: string;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [title, setTitle] = useState("Chat");
  const { username } = useUser();
  const [activeUsers, setActiveUsers] = useState<Map<string, string>>(
    new Map()
  );
  const [directMessages, setDirectMessages] = useState<DirectMessageItem[]>([]);

  const { isConnected, activeUsers: kafkaActiveUsers } = useKafka({
    onUserJoined: (message: UserStatusMessage) => {
      if (message.username !== username) {
        setActiveUsers((prev) => {
          const newMap = new Map(prev);
          newMap.set(message.username, message.consumerId);
          return newMap;
        });
      }
      // Update with full user list if provided
      if (message.dmList) {
        setActiveUsers(
          new Map(message.dmList.filter(([user]) => user !== username))
        );
      }
      updateDirectMessages();
    },
    onUserLeft: (message: UserStatusMessage) => {
      setActiveUsers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(message.username);
        return newMap;
      });
      updateDirectMessages();
    },
    onDirectMessage: (message: DirectMessage) => {
      const fromUser = message.from === username ? message.to : message.from;
      setDirectMessages((prev) => {
        const existingIndex = prev.findIndex((dm) => dm.username === fromUser);
        const updatedDM = {
          id: fromUser,
          username: fromUser,
          lastMessage: message.content,
          timestamp: new Date(message.timestamp).toLocaleTimeString(),
        };

        if (existingIndex >= 0) {
          const newDMs = [...prev];
          newDMs[existingIndex] = updatedDM;
          return newDMs;
        }

        return [...prev, updatedDM];
      });
    },
  });

  const updateDirectMessages = () => {
    const dmList = [
      {
        id: "global",
        username: "Global Chat",
        lastMessage: "Public chat room",
        timestamp: new Date().toLocaleTimeString(),
      },
      ...Array.from(activeUsers.keys()).map((user) => ({
        id: user,
        username: user,
        lastMessage: "Click to start chatting",
        timestamp: new Date().toLocaleTimeString(),
      })),
    ];
    setDirectMessages(dmList);
  };

  // Initialize DM list when component mounts
  useEffect(() => {
    updateDirectMessages();
  }, []);

  // Keep active users in sync with Kafka
  useEffect(() => {
    if (kafkaActiveUsers.size > 0) {
      setActiveUsers(
        new Map(
          Array.from(kafkaActiveUsers).filter(([user]) => user !== username)
        )
      );
      updateDirectMessages();
    }
  }, [kafkaActiveUsers, username]);

  return (
    <div className="min-h-screen flex bg-blue-50">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 z-20 transform transition-transform duration-200 ease-in-out lg:transform-none",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <Sidebar
          setTitle={setTitle}
          directMessages={directMessages}
          onClose={() => setIsSidebarOpen(false)}
          isMobile={!window.matchMedia("(min-width: 1024px)").matches}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col pl-0 lg:pl-64">
        <Navbar title={title} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="bg-white relative sm:rounded-tl-3xl shadow-lg flex-1 p-4 sm:p-8 overflow-auto max-w-[calc(7xl-64px)] mx-auto w-[calc(100%-64px)] max-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
