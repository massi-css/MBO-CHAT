import { SidebarHeader } from "./sidebar/SidebarHeader";
import { DirectMessageList } from "./sidebar/DirectMessageList";

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
  const handleNavigation = (name: string) => {
    setTitle(name);
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside className="w-64 flex flex-col h-screen pr-2 bg-blue-50">
      <SidebarHeader onClose={onClose} isMobile={isMobile} />
      <DirectMessageList
        directMessages={directMessages}
        onNavigate={handleNavigation}
      />
    </aside>
  );
}
