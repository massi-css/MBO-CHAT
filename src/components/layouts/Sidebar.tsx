import { Link, useLocation } from "react-router-dom";
import { JSX, cloneElement } from "react";
import { cn } from "@/lib/utils";
import { X, MessageCircle } from "lucide-react";
import Logo from "./Logo";
import { Button } from "../ui/button";
import { useUser } from "../../hooks/useUser";

interface DirectMessage {
  id: string;
  username: string;
  lastMessage?: string;
  timestamp?: string;
}

interface SidebarProps {
  setTitle: (title: string) => void;
  directMessages: DirectMessage[];
  onClose?: () => void;
  isMobile?: boolean;
}

export default function Sidebar({
  setTitle,
  directMessages,
  onClose,
  isMobile,
}: SidebarProps) {
  const location = useLocation();
  const { username } = useUser();

  const handleNavigation = (name: string) => {
    setTitle(name);
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside className="w-64 flex flex-col h-screen pr-2 bg-blue-50">
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-blue-50">
        <div className="flex-1">
          <Logo />
        </div>
        {isMobile && (
          <Button size="icon" className="lg:hidden" onClick={onClose}>
            <X className="h-6 w-6" />
            <span className="sr-only">Close menu</span>
          </Button>
        )}
      </div>
      <div className="px-4 py-6 flex-1 overflow-y-auto">
        <div className="space-y-1">
          <div className="flex flex-col gap-1">
            {directMessages.map((dm) => (
              <Link
                key={dm.id}
                to={`/chat/${dm.id}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors group",
                  location.pathname === `/chat/${dm.id}`
                    ? "bg-white shadow-md text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                )}
                onClick={() => handleNavigation(dm.username)}
              >
                <MessageCircle
                  className={cn(
                    "size-6 transition-colors",
                    location.pathname === `/chat/${dm.id}`
                      ? "text-slate-900"
                      : "text-slate-500 group-hover:text-blue-600"
                  )}
                />
                <div className="flex-1 overflow-hidden">
                  <div className="font-medium">{dm.username}</div>
                  {dm.lastMessage && (
                    <div className="text-xs text-slate-500 truncate">
                      {dm.lastMessage}
                    </div>
                  )}
                </div>
                {dm.timestamp && (
                  <span className="text-xs text-slate-400">{dm.timestamp}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
