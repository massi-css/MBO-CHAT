import React from "react";
import AlertDialog from "../dialogs/AlertDialog";

interface ConnectionErrorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRetry: () => void;
}

export const ConnectionErrorDialog: React.FC<ConnectionErrorDialogProps> = ({
  isOpen,
  onOpenChange,
  onRetry,
}) => {
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      title="Connection Error"
      description="Failed to connect to the chat server. Please try again or check if the server is running."
      confirmText="Try Again"
      cancelText="OK"
      variant="destructive"
      onConfirm={() => {
        onOpenChange(false);
        onRetry();
      }}
      onCancel={() => onOpenChange(false)}
    />
  );
};
