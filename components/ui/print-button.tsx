"use client";

import { Printer } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export const PrintButton = ({ label }: { label: string }): React.ReactNode => (
  <Button type="button" variant="outline" data-print="hide" className="min-h-[var(--control-height)]" onClick={() => window.print()}>
    <Printer aria-hidden="true" />
    {label}
  </Button>
);
