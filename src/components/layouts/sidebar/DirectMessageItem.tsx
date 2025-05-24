import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DirectMessage {
  id: string;
  username: string;
  lastMessage?: string;
  timestamp?: string;
}

interface DirectMessageItemProps {
  dm: DirectMessage;
  isActive: boolean;
  onNavigate: (username: string) => void;
}

export function DirectMessageItem({
  dm,
  isActive,
  onNavigate,
}: DirectMessageItemProps) {
  return (
    <Link
      key={dm.id}
      to={`/chat/${dm.id}`}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors group",
        isActive
          ? "bg-white shadow-md text-slate-900"
          : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
      )}
      onClick={() => onNavigate(dm.username)}
    >
      <MessageCircle
        className={cn(
          "size-6 transition-colors",
          isActive
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
  );
}
