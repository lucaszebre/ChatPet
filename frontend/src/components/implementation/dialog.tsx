import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  Dialog as DialogPrimitive,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as React from "react";

type DialogProps = {
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  classNameContent?: string;
  classNameTitle?: string;
};

const Dialog = ({
  trigger,
  title,
  description,
  children,
  footer,
  open,
  onOpenChange,
  classNameContent,
  classNameTitle,
}: DialogProps) => {
  return (
    <DialogPrimitive open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={classNameContent}>
        {(title || description) && (
          <DialogHeader>
            {title && (
              <DialogTitle className={classNameTitle}>{title}</DialogTitle>
            )}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}
        {children}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </DialogPrimitive>
  );
};

export default Dialog;
