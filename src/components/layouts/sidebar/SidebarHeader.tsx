import { X } from "lucide-react";
import Logo from "../Logo";
import { Button } from "../../ui/button";

interface SidebarHeaderProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export function SidebarHeader({ onClose, isMobile }: SidebarHeaderProps) {
  return (
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
  );
}
