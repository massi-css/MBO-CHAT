import { useLocation } from "react-router-dom";
import { DirectMessageItem } from "./DirectMessageItem";

interface DirectMessage {
  id: string;
  username: string;
  lastMessage?: string;
  timestamp?: string;
}

interface DirectMessageListProps {
  directMessages: DirectMessage[];
  onNavigate: (username: string) => void;
}

export function DirectMessageList({
  directMessages,
  onNavigate,
}: DirectMessageListProps) {
  const location = useLocation();

  return (
    <div className="px-4 py-6 flex-1 overflow-y-auto">
      <div className="space-y-1">
        <div className="flex flex-col gap-1">
          {directMessages.map((dm) => (
            <DirectMessageItem
              key={dm.id}
              dm={dm}
              isActive={location.pathname === `/chat/${dm.id}`}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
