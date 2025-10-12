import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialog as AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import React from "react";

export type AlertDialogProps = {
  trigger?: React.ReactNode;

  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  title: string;
  description?: string;

  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;

  variant?: "default" | "destructive" | "warning" | "info";

  children?: React.ReactNode;

  showCancel?: boolean;
  showConfirm?: boolean;

  isLoading?: boolean;

  className?: string;
};

export const AlertDialog = ({
  trigger,
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Continue",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
  children,
  showCancel = true,
  showConfirm = true,
  isLoading = false,
  className,
}: AlertDialogProps) => {
  const handleConfirm = () => {
    onConfirm?.();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "destructive":
        return {
          titleClass: "text-destructive",
          confirmClass: "bg-destructive hover:bg-destructive/90 cursor-pointer",
        };
      case "warning":
        return {
          titleClass: "text-amber-600",
          confirmClass:
            "bg-amber-600 hover:bg-amber-600/90 text-white cursor-pointer",
        };
      case "info":
        return {
          titleClass: "text-blue-600",
          confirmClass:
            "bg-blue-600 hover:bg-blue-600/90 text-white cursor-pointer",
        };
      default:
        return {
          titleClass: "",
          confirmClass: "cursor-pointer",
        };
    }
  };

  const { titleClass, confirmClass } = getVariantStyles();

  return (
    <AlertDialogRoot open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}

      <AlertDialogContent className={className}>
        <AlertDialogHeader>
          <AlertDialogTitle className={titleClass}>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>

        {children && <>{children}</>}

        <AlertDialogFooter>
          {showCancel && (
            <AlertDialogCancel
              onClick={(e) => {
                e.stopPropagation();
                handleCancel();
              }}
              disabled={isLoading}
              className="cursor-pointer"
            >
              {cancelText}
            </AlertDialogCancel>
          )}
          {showConfirm && (
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isLoading}
              className={confirmClass}
            >
              {isLoading ? "Loading..." : confirmText}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogRoot>
  );
};
