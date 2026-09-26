"use client";

import { useEffect, useState } from "react";

const formatRemaining = (milliseconds: number): string => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours} jam ${String(minutes).padStart(2, "0")} menit ${String(seconds).padStart(2, "0")} detik`;
};

export const DpCountdown = ({ dueAt }: { dueAt: string }): React.ReactNode => {
  const dueTime = new Date(dueAt).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = (): void => setNow(Date.now());
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  if (now === null) return null;
  const remaining = dueTime - now;
  return (
    <p role="timer" aria-live="off" className="text-lg font-semibold tabular-nums">
      {remaining > 0 ? `Sisa waktu ${formatRemaining(remaining)}` : "Batas waktu DP sudah lewat"}
    </p>
  );
};
