"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./button";

type SheetContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheet() {
  const ctx = React.useContext(SheetContext);
  if (!ctx) throw new Error("Sheet components must be used within Sheet");
  return ctx;
}

type SheetProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

function Sheet({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: SheetProps) {
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
    <SheetContext.Provider value={{ open, onOpenChange: setOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

type SheetTriggerProps = React.ComponentProps<"button"> & {
  render?: React.ReactElement;
  asChild?: boolean;
};

function SheetTrigger({ children, render, asChild, ...props }: SheetTriggerProps) {
  const { onOpenChange } = useSheet();
  const handleClick = () => onOpenChange(true);
  const child = render ?? (React.Children.only(children) as React.ReactElement);
  if (render || asChild) {
    const childProps = child.props && typeof child.props === "object" ? child.props : {};
    const mergedProps = {
      ...childProps,
      ...props,
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        (childProps as { onClick?: (e: React.MouseEvent<HTMLElement>) => void }).onClick?.(e);
        handleClick();
      },
    };
    return React.cloneElement(child, mergedProps as React.HTMLAttributes<HTMLElement>);
  }
  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

type SheetContentProps = React.ComponentProps<"div"> & {
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
};

const sideVariants = {
  top: {
    initial: { y: "-100%" },
    animate: { y: 0 },
    exit: { y: "-100%" },
  },
  right: {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: "100%" },
  },
  bottom: {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
  },
  left: {
    initial: { x: "-100%" },
    animate: { x: 0 },
    exit: { x: "-100%" },
  },
};

function SheetContent({
  side = "bottom",
  showCloseButton = true,
  className,
  children,
}: SheetContentProps) {
  const { open, onOpenChange } = useSheet();
  const variants = sideVariants[side];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onOpenChange(false)}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              "fixed z-50 flex flex-col bg-background shadow-lg",
              side === "top" && "inset-x-0 top-0 border-b",
              side === "bottom" && "inset-x-0 bottom-0 border-t max-h-[85vh]",
              side === "left" && "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r",
              side === "right" && "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l",
              className
            )}
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {showCloseButton && (
              <div className="flex shrink-0 justify-end p-2">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onOpenChange(false)}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-auto px-4 pb-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export { Sheet, SheetTrigger, SheetContent };
