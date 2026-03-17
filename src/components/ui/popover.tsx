"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type PopoverContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopover() {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) throw new Error("Popover components must be used within Popover");
  return ctx;
}

type PopoverProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

function Popover({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = React.useCallback(
    (value: boolean) => {
      if (!isControlled) setUncontrolledOpen(value);
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange]
  );

  return (
    <PopoverContext.Provider value={{ open, onOpenChange: setOpen }}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  );
}

type PopoverTriggerProps = React.ComponentProps<"button"> & {
  asChild?: boolean;
};

function PopoverTrigger({ children, asChild, ...props }: PopoverTriggerProps) {
  const { open, onOpenChange } = usePopover();
  const handleClick = () => onOpenChange(!open);
  const child = React.Children.only(children) as React.ReactElement;
  if (asChild) {
    const childProps = child.props && typeof child.props === "object" ? child.props : {};
    const mergedProps = {
      ...childProps,
      ...props,
      "data-popover-trigger": true,
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        (childProps as { onClick?: (e: React.MouseEvent<HTMLElement>) => void }).onClick?.(e);
        handleClick();
      },
    };
    return React.cloneElement(child, mergedProps as React.HTMLAttributes<HTMLElement>);
  }
  return (
    <button type="button" onClick={handleClick} data-popover-trigger {...props}>
      {children}
    </button>
  );
}

type PopoverContentProps = React.ComponentProps<"div"> & {
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
};

function PopoverContent({
  align = "end",
  side = "bottom",
  className,
  children,
  ...props
}: PopoverContentProps) {
  const { open, onOpenChange } = usePopover();
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (contentRef.current?.contains(target)) return;
      if (target.closest("[data-popover-trigger]")) return;
      onOpenChange(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      role="dialog"
      aria-modal="true"
      className={cn(
        "absolute z-50 min-w-[180px] rounded-lg border bg-popover p-2 text-popover-foreground shadow-md",
        side === "bottom" && "top-full mt-2",
        side === "top" && "bottom-full mb-2",
        side === "left" && "right-full mr-2",
        side === "right" && "left-full ml-2",
        align === "end" && "right-0",
        align === "start" && "left-0",
        align === "center" && "left-1/2 -translate-x-1/2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Popover, PopoverTrigger, PopoverContent };
