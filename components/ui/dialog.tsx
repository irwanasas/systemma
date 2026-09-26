"use client";

import { useSyncExternalStore } from "react";
import { X } from "@phosphor-icons/react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;

export const DialogTrigger = DialogPrimitive.Trigger;

export const DialogClose = DialogPrimitive.Close;

const SMALL_SCREEN_QUERY = "(max-width: 639px)";

const subscribeToViewport = (onChange: () => void): (() => void) => {
  window.visualViewport?.addEventListener("resize", onChange);
  window.addEventListener("resize", onChange);
  return () => {
    window.visualViewport?.removeEventListener("resize", onChange);
    window.removeEventListener("resize", onChange);
  };
};

const readMaxHeight = (): number => {
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  const share = window.matchMedia(SMALL_SCREEN_QUERY).matches ? 0.95 : 0.9;
  return Math.round(viewportHeight * share);
};

const useDialogMaxHeight = (): number | undefined =>
  useSyncExternalStore(subscribeToViewport, readMaxHeight, () => undefined);

type DialogContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
  size?: "sm" | "lg";
};

export const DialogContent = ({ className, size = "sm", style, children, ...props }: DialogContentProps): React.ReactNode => {
  const maxHeight = useDialogMaxHeight();
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay data-slot="dialog-overlay" className="fixed inset-0 z-50 bg-black/50" />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        style={{ maxHeight: maxHeight ? `${maxHeight}px` : "90dvh", ...style }}
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface text-foreground shadow-xl outline-none",
          size === "lg" ? "max-w-3xl" : "max-w-lg",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
};

type DialogHeaderProps = React.ComponentProps<"div"> & {
  onClose?: () => void;
};

export const DialogHeader = ({ className, children, onClose, ...props }: DialogHeaderProps): React.ReactNode => (
  <div
    data-slot="dialog-header"
    className={cn("flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4", className)}
    {...props}
  >
    <div className="flex min-w-0 flex-col gap-1">{children}</div>
    {onClose ? (
      <button
        type="button"
        data-slot="dialog-close"
        aria-label="Tutup"
        onClick={onClose}
        className="-mt-1 -mr-2 inline-flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X aria-hidden="true" className="size-5" />
      </button>
    ) : (
      <DialogPrimitive.Close
        data-slot="dialog-close"
        aria-label="Tutup"
        className="-mt-1 -mr-2 inline-flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X aria-hidden="true" className="size-5" />
      </DialogPrimitive.Close>
    )}
  </div>
);

export const DialogBody = ({ className, ...props }: React.ComponentProps<"div">): React.ReactNode => (
  <div data-slot="dialog-body" className={cn("min-h-0 flex-auto overflow-y-auto px-5 py-4", className)} {...props} />
);

export const DialogFooter = ({ className, ...props }: React.ComponentProps<"div">): React.ReactNode => (
  <div
    data-slot="dialog-footer"
    className={cn("flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border px-5 py-3", className)}
    {...props}
  />
);

export const DialogTitle = ({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>): React.ReactNode => (
  <DialogPrimitive.Title data-slot="dialog-title" className={cn("text-lg leading-snug font-semibold", className)} {...props} />
);

export const DialogDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>): React.ReactNode => (
  <DialogPrimitive.Description
    data-slot="dialog-description"
    className={cn("text-ui text-muted-foreground", className)}
    {...props}
  />
);
