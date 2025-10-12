import {
  TooltipContent,
  Tooltip as TooltipPrimitive,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import * as React from "react";

type TooltipProps = {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delayDuration?: number;
  disabled: boolean;
};

export const Tooltip = ({
  children,
  content,
  side = "top",
  align = "center",
  delayDuration = 100,
  disabled,
}: TooltipProps) => {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <TooltipPrimitive>
        <TooltipTrigger>{children}</TooltipTrigger>
        {!disabled && (
          <TooltipContent side={side} align={align} sideOffset={4}>
            {content}
          </TooltipContent>
        )}
      </TooltipPrimitive>
    </TooltipProvider>
  );
};
