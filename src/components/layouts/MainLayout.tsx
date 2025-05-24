import { ReactNode, useState, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/layouts/Sidebar";
import Navbar from "@/components/layouts/Navbar";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";
import { useKafka } from "@/hooks/useKafka";
import { UserStatusMessage } from "@/types/kafka";

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
  const { username, initialActiveUsers } = useUser();
  const [directMessages, setDirectMessages] = useState<DirectMessageItem[]>([]);

  // Use activeUsers from Kafka hook which maintains the up-to-date list
  const { activeUsers: kafkaActiveUsers } = useKafka({
    onUserJoined: (message: UserStatusMessage) => {
      updateDirectMessages(kafkaActiveUsers);
    },
    onUserLeft: (message: UserStatusMessage) => {
      updateDirectMessages(kafkaActiveUsers);
    },
  });
  const updateDirectMessages = useCallback(
    (userList: Map<string, string>) => {
      const filteredUsers = new Map(
        Array.from(userList).filter(([user]) => user !== username)
      );
      const dmList = Array.from(filteredUsers.keys()).map((user) => ({
        id: user,
        username: user === "global" ? "Global Chat" : user,
        lastMessage:
          user === "global" ? "Public chat room" : "Click to start chatting",
        timestamp: new Date().toLocaleTimeString(),
      }));

      const sortedList = dmList.sort((a, b) => {
        if (a.id === "global") return -1;
        if (b.id === "global") return 1;
        return a.username.localeCompare(b.username);
      });

      setDirectMessages(sortedList);
    },
    [username]
  );

  useEffect(() => {
    if (initialActiveUsers.size > 0) {
      updateDirectMessages(initialActiveUsers);
    }
  }, [initialActiveUsers, updateDirectMessages]);

  useEffect(() => {
    if (kafkaActiveUsers.size > 0) {
      updateDirectMessages(kafkaActiveUsers);
    }
  }, [kafkaActiveUsers, updateDirectMessages]);

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
