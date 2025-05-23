import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/auth.store";
import { User as UserIcon, KeyRound, Link } from "lucide-react";
import { useState } from "react";
import ProfileTabContent from "./account-tabs-content/ProfileTabContent";
import SettingsTabContent from "./account-tabs-content/SettingsTabContent";
import IntegrationsTabContent from "./account-tabs-content/IntegrationsTabContent";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabType = "profile" | "settings" | "integrations";

export default function AccountDialog({
  open,
  onOpenChange,
}: AccountDialogProps) {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  if (!user)
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[80vw] max-w-4xl z-50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Account</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center h-full p-6">
            <h3 className="text-lg font-semibold">Something went wrong</h3>
            <p className="text-sm text-slate-500">
              Please try again later or contact support.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );

  const renderTabs = () => (
    <div className="border-b mb-3">
      <div className="flex space-x-6">
        <TabButton
          active={activeTab === "profile"}
          onClick={() => setActiveTab("profile")}
          icon={<UserIcon className="h-4 w-4" />}
        >
          Profile
        </TabButton>
        <TabButton
          active={activeTab === "settings"}
          onClick={() => setActiveTab("settings")}
          icon={<KeyRound className="h-4 w-4" />}
        >
          Settings
        </TabButton>
        <TabButton
          active={activeTab === "integrations"}
          onClick={() => setActiveTab("integrations")}
          icon={<Link className="h-4 w-4" />}
        >
          Integrations
        </TabButton>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] md:w-[85vw] lg:w-[70vw] xl:w-[60vw] max-w-3xl max-h-[90vh] h-[90vh] overflow-hidden flex flex-col z-50">
        <DialogHeader className="shrink-0 pb-4">
          <DialogTitle className="text-xl font-bold">Account</DialogTitle>
        </DialogHeader>
        <div className="h-[10%] shrink-0">{renderTabs()}</div>
        <div className="h-[90%] overflow-y-auto pr-2">
          <div className="h-full">
            {activeTab === "profile" && (
              <ProfileTabContent user={user} logout={logout} />
            )}
            {activeTab === "settings" && <SettingsTabContent />}
            {activeTab === "integrations" && <IntegrationsTabContent />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}

function TabButton({ active, onClick, children, icon }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-slate-500 hover:text-slate-900"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
