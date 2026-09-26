"use client";

import { Toaster as SonnerToaster } from "sonner";

export const Toaster = (): React.ReactNode => (
  <SonnerToaster
    position="top-center"
    toastOptions={{
      classNames: {
        toast: "!bg-surface !text-foreground !border !border-border !rounded-lg !shadow-lg !font-sans",
        description: "!text-muted-foreground",
        actionButton: "!bg-primary !text-primary-foreground !font-semibold",
      },
    }}
  />
);
