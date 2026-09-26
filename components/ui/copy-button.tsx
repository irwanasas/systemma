"use client";

import { useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export const CopyButton = ({ value, label }: { value: string; label: string }): React.ReactNode => {
  const [isCopied, setIsCopied] = useState(false);
  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(value);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 2000);
  };
  return (
    <Button type="button" variant="outline" className="min-h-[var(--control-height)]" onClick={handleCopy} aria-label={label}>
      {isCopied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      <span aria-live="polite">{isCopied ? "Tersalin" : "Salin"}</span>
    </Button>
  );
};
