import { ReactNode, useState } from "react";
import Sidebar from "@/components/layouts/Sidebar";
import Navbar from "@/components/layouts/Navbar";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [title, setTitle] = useState("Chat");
  const { username } = useUser();

  // Example direct messages - in a real app, this would come from your backend
  const directMessages = [
    {
      id: "1",
      username: "Alice",
      lastMessage: "Hey, how are you?",
      timestamp: "12:30 PM",
    },
    {
      id: "2",
      username: "Bob",
      lastMessage: "Did you see the new updates?",
      timestamp: "11:45 AM",
    },
    {
      id: "3",
      username: "Charlie",
      lastMessage: "Let's catch up later!",
      timestamp: "10:15 AM",
    },
  ];

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
        {" "}
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
        <main className="bg-white relative sm:rounded-tl-3xl shadow-lg flex-1 p-4 sm:p-8 overflow-auto max-w-7xl mx-auto w-full max-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
