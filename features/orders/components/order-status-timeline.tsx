import { CheckCircle, Circle, DotOutline } from "@phosphor-icons/react/ssr";
import { MAIN_STATUS_PATH, orderStatusLabels, type OrderStatus } from "@/features/orders/types";
import { cn } from "@/lib/utils";

export const OrderStatusTimeline = ({ status }: { status: OrderStatus }): React.ReactNode => {
  if (status === "CANCELLED" || status === "EXPIRED") {
    return (
      <section aria-labelledby="timeline-heading" className="rounded-lg border border-border bg-surface p-4">
        <h2 id="timeline-heading">Perjalanan pesanan</h2>
        <p>
          {status === "CANCELLED"
            ? "Pesanan dibatalkan sebelum DP dibayar."
            : "Pesanan kedaluwarsa karena bukti DP tidak diunggah dalam batas waktu."}
        </p>
      </section>
    );
  }
  const currentIndex = MAIN_STATUS_PATH.indexOf(status);
  return (
    <section aria-labelledby="timeline-heading" className="rounded-lg border border-border bg-surface p-4">
      <h2 id="timeline-heading">Perjalanan pesanan</h2>
      <ol className="flex list-none flex-col gap-2 p-0">
        {MAIN_STATUS_PATH.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          const StepIcon = isDone ? CheckCircle : isCurrent ? DotOutline : Circle;
          return (
            <li
              key={step}
              aria-current={isCurrent ? "step" : undefined}
              className={cn("flex items-center gap-2", isCurrent ? "font-semibold" : "text-muted-foreground", isDone && "text-foreground")}
            >
              <StepIcon aria-hidden="true" weight={isCurrent ? "fill" : "regular"} className={cn(isDone && "text-success", isCurrent && "text-primary-strong")} />
              <span>
                {orderStatusLabels[step]}
                <span className="sr-only"> — {isDone ? "selesai" : isCurrent ? "tahap sekarang" : "belum"}</span>
                {isCurrent && <span aria-hidden="true"> (sekarang)</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
