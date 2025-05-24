import {
  AlertDialog as AlertDialogPrimitive,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  description: string;
  cancelText?: string;
  confirmText?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel?: () => void;
}

const AlertDialog = ({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  cancelText = "Cancel",
  confirmText = "Continue",
  variant = "default",
  onConfirm,
  onCancel,
}: AlertDialogProps) => {
  return (
    <AlertDialogPrimitive open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}{" "}
      <AlertDialogContent className="sm:max-w-[425px] gap-0 p-0 overflow-hidden">
        <AlertDialogHeader className="p-6 pb-0">
          <AlertDialogTitle className="text-xl font-semibold tracking-tight">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-3 text-[15px] leading-normal text-gray-500">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="px-6 py-4 bg-gray-50/80 border-t gap-3">
          <AlertDialogCancel
            onClick={onCancel}
            className="flex-1 mt-0 px-8 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-medium shadow-sm transition-all hover:border-gray-300"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn(
              "flex-1 px-8 shadow-sm transition-all font-medium",
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 text-white border border-red-600"
                : "bg-primary hover:bg-primary text-white border border-primary"
            )}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogPrimitive>
  );
};

export default AlertDialog;
